import os
import json
import numpy as np
import tensorflow as tf
import tensorflow.keras.backend as K

import datetime
from common.utils import *
from models.local_model import LocalModel
from models.bbdrop.bbdropout import BBDropout

class LocalCNN(LocalModel):

    def __init__(self, client_id, data_info, opt):
        super(LocalCNN, self).__init__(client_id, data_info, opt)
        self.opt = opt
        self.client_id = client_id
        self.data_info = data_info
    
    def initialize(self, model_info):
        self.models = []
        self.model_info = model_info
        self.prev_task_weights = []
        self.optimizer = self.get_optimizer(self.opt.lr)
        self.build_local_model()
        if self.opt.load_weights:
            weights = load_weights(self.opt.load_weights_dir)
            self.model_body.set_weights(weights)

    def build_local_model(self):
        if self.opt.continual:
            self.model_body = tf.keras.models.model_from_json(self.model_info) #, {'BBDropout': BBDropout}
            self.model_head = [tf.keras.layers.Dense(self.opt.num_classes,  activation='softmax', 
                                    name='head-task-'+str(i+1)) for i in range(self.data_info['num_tasks'])]
            body_out = self.model_body.output
            for i in range(self.data_info['num_tasks']):
                x = self.model_head[i](body_out)
                model = tf.keras.Model(inputs=self.model_body.input, outputs=x)
                self.models.append(model) # multiheaded model 
        else:
            self.model_body = tf.keras.models.model_from_json(self.model_info) # no weights included
            self.model_head = tf.keras.layers.Dense(self.opt.num_classes,  activation='softmax', 
                                    name='head-task-'+str(self.current_task))
            body_out = self.model_body.output
            x = self.model_head(body_out)
            model = tf.keras.Model(inputs=self.model_body.input, outputs=x)
            self.models.append(model) # multiheaded model 

    def get_optimizer(self, lr):
        # if self.opt.optimizer == 0:
        #     return tf.keras.optimizers.SGD(learning_rate=lr)
        # elif self.opt.optimizer == 1:
        return tf.keras.optimizers.Adam(learning_rate=lr)

    # @tf.function <-- can't use tf.function because of the l2 reg_loss
    def loss(self, model, y_true, y_pred):
        loss = tf.keras.losses.categorical_crossentropy(y_true, y_pred)
        # if self.opt.sparsify:
        #     loss += self.get_sparse_reg(model)
        if self.opt.continual and len(self.prev_task_weights)>0:
            pweights = self.prev_task_weights[-1]
            current_task_weights = self.model_body.trainable_weights
            subtracted = [pweights[i]-current_task_weights[i] for i in range(len(pweights))]
            squared = [tf.math.square(subtracted[i]) for i in range(len(subtracted))]
            reduced = [tf.math.reduce_sum(squared[i]) for i in range(len(squared))]
            reg_loss = self.opt.l2_lambda * tf.math.reduce_sum(reduced) # layer-wise sum
            loss += reg_loss
        return loss

    def init_on_new_task(self):
        if self.opt.continual:
            if self.current_task > 0:
                self.save_prev_task_weights()
                syslog(self.client_id, 'saved previous weights')            
        else:
            self.build_local_model()

    def get_weights(self):
        return self.model_body.get_weights()

    def set_weights(self, new_weights):
        self.model_body.set_weights(new_weights)

    def save_prev_task_weights(self):
        self.prev_task_weights.append(self.model_body.get_weights()) # use queue 

    def get_sparse_reg(self, model):
        reg = 0
        for l in model.layers:
            if 'bb_dropout' in l.name:
                reg += l.get_reg()
        return reg

