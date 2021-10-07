import tensorflow as tf
from models.global_model import GlobalModel
from models.bbdrop.bbdropout import BBDropout

class GlobalCNN(GlobalModel):

    def __init__(self, opt):
        super(GlobalCNN, self).__init__(opt)
        self.opt = opt
        self.build_model()
        
    def build_model(self):
        if self.opt.base_architect == 0:
            self.model = self.build_modified_lenet()
        elif self.opt.base_architect == 1:
            self.model = self.build_modified_alexnet()
        return self.model
    
    def build_modified_lenet(self):
        # Modified LeNet
        inputs = tf.keras.Input((32, 32, 3))
        x = tf.keras.layers.Conv2D(20, kernel_size=(5, 5), use_bias=True)(inputs)
        x = tf.nn.lrn(x, 4, bias=1.0, alpha=0.001/9.0, beta=0.75)
        x = tf.keras.layers.MaxPooling2D(pool_size=(3, 3), strides=(2, 2), padding='same')(x)
        x = tf.keras.layers.Conv2D(50, kernel_size=(5, 5), use_bias=True)(x)
        x = tf.nn.lrn(x, 4, bias=1.0, alpha=0.001/9.0, beta=0.75)
        x = tf.keras.layers.MaxPooling2D(pool_size=(3, 3), strides=(2, 2), padding='same')(x)
        x = tf.keras.layers.Flatten()(x)
        x = tf.keras.layers.Dense(800, activation='relu')(x)
        x = tf.keras.layers.Dense(500, activation='relu')(x)
        # Tensorflow LeNet
        # self.model = tf.keras.models.Sequential()
        # self.model.add(tf.keras.layers.Conv2D(32, kernel_size=(3, 3), activation='relu', input_shape=(32, 32, 3)))
        # self.model.add(tf.keras.layers.Conv2D(64, (3, 3), activation='relu'))
        # self.model.add(tf.keras.layers.MaxPooling2D(pool_size=(2, 2)))
        # self.model.add(tf.keras.layers.Dropout(0.25))
        # self.model.add(tf.keras.layers.Flatten())
        # self.model.add(tf.keras.layers.Dense(128, activation='relu')) #512
        # self.model.add(tf.keras.layers.Dropout(0.5))
        return tf.keras.Model(inputs=inputs, outputs=x)
        
    def build_modified_alexnet(self):
        # if self.opt.sparsify:
        #     # AlexNet-like + BBDropout
        #     inputs = tf.keras.Input((32, 32, 3))
        #     x = tf.keras.layers.Conv2D(64, kernel_size=(4, 4), use_bias=True, activation='relu')(inputs)
        #     x = BBDropout(num_gates=64, name='sparsify_1')(x)
        #     x = tf.keras.layers.Dropout(0.2)(x)
        #     x = tf.keras.layers.MaxPooling2D(pool_size=(2, 2))(x)
        #     x = tf.keras.layers.Conv2D(128, kernel_size=(3, 3), use_bias=True, activation='relu')(x)
        #     x = BBDropout(num_gates=128, name='sparsify_2')(x)
        #     x = tf.keras.layers.Dropout(0.2)(x)
        #     x = tf.keras.layers.MaxPooling2D(pool_size=(2, 2))(x)
        #     x = tf.keras.layers.Conv2D(256, kernel_size=(2, 2), use_bias=True, activation='relu')(x)
        #     x = BBDropout(num_gates=256, name='sparsify_3')(x)
        #     x = tf.keras.layers.Dropout(0.5)(x)
        #     x = tf.keras.layers.MaxPooling2D(pool_size=(2, 2))(x)
        #     x = tf.keras.layers.Flatten()(x)
        #     x = BBDropout(num_gates=1024, name='sparsify_4')(x)
        #     x = tf.keras.layers.Dense(512, activation='relu')(x)
        #     x = tf.keras.layers.Dropout(0.5)(x)
        #     x = BBDropout(num_gates=512, name='sparsify_5')(x)
        #     x = tf.keras.layers.Dense(512, activation='relu')(x)
        #     x = tf.keras.layers.Dropout(0.5)(x)
        # else:
        # AlexNet-like
        inputs = tf.keras.Input((32, 32, 3))
        x = tf.keras.layers.Conv2D(64, kernel_size=(4, 4), use_bias=True, activation='relu')(inputs)
        x = tf.keras.layers.Dropout(0.2)(x)
        x = tf.keras.layers.MaxPooling2D(pool_size=(2, 2))(x)
        x = tf.keras.layers.Conv2D(128, kernel_size=(3, 3), use_bias=True, activation='relu')(inputs)
        x = tf.keras.layers.Dropout(0.2)(x)
        x = tf.keras.layers.MaxPooling2D(pool_size=(2, 2))(x)
        x = tf.keras.layers.Conv2D(256, kernel_size=(2, 2), use_bias=True, activation='relu')(inputs)
        x = tf.keras.layers.Dropout(0.5)(x)
        x = tf.keras.layers.MaxPooling2D(pool_size=(2, 2))(x)
        x = tf.keras.layers.Flatten()(x)
        x = tf.keras.layers.Dense(512, activation='relu')(x)
        x = tf.keras.layers.Dropout(0.5)(x)
        x = tf.keras.layers.Dense(512, activation='relu')(x)
        x = tf.keras.layers.Dropout(0.5)(x)
        return tf.keras.Model(inputs=inputs, outputs=x)

    def get_info(self):
        return self.model.to_json()
            
    def get_weights(self):
        return self.model.get_weights()

    def set_weights(self, weights):
        self.weights = weights

    def update_weights(self, responses): 
        client_weights = [resp['client_weights'] for resp in responses]
        client_sizes = [resp['train_size'] for resp in responses]
        train_sizes_per_class = [resp['train_size_per_class'] for resp in responses] #  added
        self.apply_federated_average(client_weights, client_sizes)

    def get_sparsification_reg(self):
        reg = 0
        for sl in self.sparse_layers:
            reg += sl.get_reg()
        return reg