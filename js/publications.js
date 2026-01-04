let arxivCounter = 12;
let paperCounter = 35;
let journalCounter = 2;

function escHtml(s) {
  return String(s ?? "")
    .replaceAll("&", "\&")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function safeIdFromTitle(title) {
  return String(title ?? "")
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-]/g, "")
    .slice(0, 80);
}

function linkBtn(label, href) {
  if (!href || href === "None") return "";
  return `<a class="paper-btn" href="${escHtml(href)}" target="_blank" rel="noopener">${escHtml(label)}</a>`;
}

function btn(label, onClickJs) {
  return `<button class="paper-btn" type="button" onclick="${escHtml(onClickJs)}">${escHtml(label)}</button>`;
}

function toggleAuthors(id, expand) {
    const etAl = document.querySelector(`.et-al-${id}`);
    const fullAuthors = document.querySelector(`.full-authors-${id}`);
    if (!etAl || !fullAuthors) return;
    if (expand) {
      etAl.style.display = "none";
      fullAuthors.style.display = "inline";
    } else {
      etAl.style.display = "inline";
      fullAuthors.style.display = "none";
    }
  }

function highlightMeHtml(s) {
    return String(s ?? "").replaceAll("Jaehong Yoon", `<span class="me">Jaehong Yoon</span>`);
  }
function highlightMeText(s) {
    return escHtml(s).replaceAll("Jaehong Yoon", `<span class="me">Jaehong Yoon</span>`);
  }

function buildBibtex({ type, key, title, authorBib, venueFull, year, arxivId }) {
    if (type === "arxiv") {
        return `@article{${key},
    title={${title}},
    author={${authorBib}},
    journal={arXiv preprint arXiv:${arxivId}},
    year={${year}}
    }`;
    }
    return `@inproceedings{${key},
    title={${title}},
    author={${authorBib}},
    booktitle={${venueFull}},
    year={${year}}
    }`;
}
    
function show(id) {
    const el = document.getElementById(id);
    if (el) el.classList.toggle("open");
}
  
function _addCard({
    counter, prefix, decrement,  
    type = "conf", // "conf" | "journal" | "arxiv"  
    name_, year_, title_, author_, bib_author_,
  
    venue_,            // conf or journal name
    venue_full_name_,  // bibtex full venue
  
    project_, paper_, code_, dataset_,
    thumb_,
  
    // et al toggle option
    toggleID = null,
    etalPreview = "",
    fullAuthorHTML = "",
  
    // for arxiv
    arxiv_ = null,
  }) {
    const container = document.getElementById(paperContainerId);
    if (!container) return;
  
    const bibId = `bib-${safeIdFromTitle(title_)}-${counter}`;
  
    const thumbSrc =
      thumb_ && thumb_ !== "None"
        ? escHtml(thumb_)
        : "./materials/concept_figures/placeholder.png";
  
    // authors block
    let authorsHTML = "";
    if (toggleID) {
      authorsHTML = `
        <div class="paper-authors">
          ${highlightMeHtml(etalPreview)}
          <span class="et-al-${escHtml(toggleID)}"
                onclick="toggleAuthors('${escHtml(toggleID)}', true)"
                style="cursor:pointer;text-decoration:underline;">
            et al.
          </span>
          <span class="full-authors-${escHtml(toggleID)}" style="display:none;">
            ${highlightMeHtml(fullAuthorHTML)}
            <span onclick="toggleAuthors('${escHtml(toggleID)}', false)"
                  style="cursor:pointer;text-decoration:underline;margin-left:8px;">
              (▲ Hide)
            </span>
          </span>
        </div>
      `;
    } else {
      const authorHtml = escHtml(author_).replaceAll(
        "Jaehong Yoon",
        `<span class="me">Jaehong Yoon</span>`
      );
      authorsHTML = `<div class="paper-authors">${authorHtml}</div>`;
    }
  
    // meta line
    const metaHtml =
      type === "arxiv"
        ? `<span class="arxiv">arXiv ${escHtml(year_)}</span>`
        : `<span class="venue">${escHtml(venue_)} ${escHtml(year_)}</span>`;
  
    // bibtex
    const bib = buildBibtex({
      type,
      key: escHtml(name_),
      title: escHtml(title_),
      authorBib: escHtml(bib_author_),
      venueFull: escHtml(venue_full_name_),
      year: escHtml(year_),
      arxivId: escHtml(arxiv_ ?? ""),
    });
      
    const projectBtn = linkBtn("Project", project_);
    const paperBtn =
      type === "arxiv"
        ? (arxiv_ ? `<a class="paper-btn" href="https://arxiv.org/abs/${escHtml(arxiv_)}" target="_blank" rel="noopener">Paper</a>` : "")
        : linkBtn("Paper", paper_);
  
    const datasetBtn = linkBtn("Dataset", dataset_);
    const codeBtn = linkBtn("Code", code_);
  
    const html = `
      <div class="paper-item" data-type=${type}>
        <div class="paper-thumb">
          <img src="${thumbSrc}" alt="thumbnail">
        </div>
  
        <div class="paper-content">
          <div class="paper-title">
            <span class="paper-tag" data-type=${type}>${prefix}${counter}</span>
            ${escHtml(title_)}
          </div>
  
          ${authorsHTML}
  
          <div class="paper-meta">
            ${metaHtml}
          </div>
  
          <div class="paper-links">
            ${projectBtn}
            ${paperBtn}
            ${codeBtn}
            ${datasetBtn}
            ${btn("BibTeX", `show('${bibId}')`)}
          </div>
  
          <div id="${bibId}" class="bib-popup">
            <pre><code>${escHtml(bib)}</code></pre>
          </div>
        </div>
      </div>
    `;
  
    container.insertAdjacentHTML("beforeend", html);
    decrement();
  }
  
  function addPaperCard(
    name_, year_, title_, author_, bib_author_,
    venue_, venue_full_name_,
    project_ = "None",
    paper_ = "None",
    code_ = "None",
    dataset_ = "None",
    thumb_ = "None",
    toggleID = null,
    etalPreview = "",
    fullAuthorHTML = ""
  ) {
    _addCard({
      type: "conf",
      counter: paperCounter,
      prefix: "C",
      decrement: () => paperCounter--,
      name_, year_, title_, author_, bib_author_,
      venue_, venue_full_name_,
      project_, paper_, code_, dataset_,
      thumb_,
      toggleID, etalPreview, fullAuthorHTML,
    });
  }
  
  function addJournalCard(
    name_, year_, title_, author_, bib_author_,
    venue_, venue_full_name_,
    project_ = "None",
    paper_ = "None",
    code_ = "None",
    dataset_ = "None",
    thumb_ = "None",
    toggleID = null,
    etalPreview = "",
    fullAuthorHTML = ""
  ) {
    _addCard({
      type: "journal",
      counter: journalCounter,
      prefix: "J",
      decrement: () => journalCounter--,
      name_, year_, title_, author_, bib_author_,
      venue_, venue_full_name_,
      project_, paper_, code_, dataset_,
      thumb_,
      toggleID, etalPreview, fullAuthorHTML,
    });
  }
  
  function addArxivCard(
    name_, year_, title_, author_, bib_author_,
    arxiv_,
    project_ = "None",
    paper_ = "None",
    code_ = "None",
    dataset_ = "None",
    thumb_ = "None",
    toggleID = null,
    etalPreview = "",
    fullAuthorHTML = ""
  ) {
    _addCard({
      type: "arxiv",
      counter: arxivCounter,
      prefix: "P",
      decrement: () => arxivCounter--,  
      name_, year_, title_, author_, bib_author_,
      venue_: "", venue_full_name_: "",
      project_, paper_, code_, dataset_,
      thumb_,
      toggleID, etalPreview, fullAuthorHTML,
      arxiv_,
    });
  }

//   function addArxivCardCompat(
//     name_, year_, title_, author_, bib_author_,
//     arxiv_, project_ = "None", dataset_ = "None", code_ = "None", paper_ = "None", thumb_ = "None"
//   ) {
//     addArxivCard({
//       name_, year_, title_, author_, bib_author_,
//       arxiv_,
//       project_,
//       dataset_,
//       code_,
//       paper_,
//       thumb_,
//     });
//   }