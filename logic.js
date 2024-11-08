let randomArticle = document.getElementById("randomArticle");
let textField = document.getElementById("textField");
let amount = document.getElementById("quantity");
let minViews = document.getElementById("minViews");
let useMinViewsBox = document.getElementById("useMinViews");
let resultWrapper = document.getElementById("resultWrapper");
let startDateField = document.getElementById("startDate");
let endDateField = document.getElementById("endDate");
let datePickerBeforeOne = document.getElementsByClassName("date-picker-before")[0];
let datePickerBeforeTwo = document.getElementsByClassName("date-picker-before")[1];
let modeIndicator = document.getElementById("mode-indicator");

let lastAction = "random";
let abortControllerList = [];
let startDate = "20220101";
let endDate = "20220201";

const date = new Date();

let day = date.getDate();
let month = date.getMonth() + 1;
let year = date.getFullYear();

endDate = `${year}${month.toString().padStart(2, '0')}${day.toString().padStart(2, '0')}`;
startDate = `${year -1 }${month.toString().padStart(2, '0')}${day.toString().padStart(2, '0')}`;

startDateField.value = wikiDateToHtmlDate(startDate);
endDateField.value = wikiDateToHtmlDate(endDate);

let randomModeText = ""
let searchModeText = ""

textField.addEventListener("keyup", (event) => {
    getResponse(useMinViewsBox.checked);
})

amount.addEventListener("input", () => {
    if (lastAction == "random" || textField.value == "") {
        getRandomResponse();
    } else {
        getResponse(useMinViewsBox.checked);
    }
})

minViews.addEventListener("input", () => {
    if (useMinViewsBox.checked) {
        getRandomResponse();
    }
})

useMinViewsBox.addEventListener("input", () => {
    if (lastAction == "random") {
        getRandomResponse();
    } else {
        getResponse(useMinViewsBox.checked);
    }
})

randomArticle.addEventListener("click", () => {
    getRandomResponse();
})

startDateField.addEventListener("input", () => {
    let oldStartDate = startDate;
    startDate = startDateField.value.split("-").join("");

    if (parseInt(endDate) <= parseInt(startDate)) {
        startDateField.value = wikiDateToHtmlDate(oldStartDate);
        startDate = oldStartDate;
        startDateField.classList.add("date-animation");
        datePickerBeforeOne.classList.add("date-animation");
        setTimeout(function () {
            startDateField.classList.remove("date-animation");
            datePickerBeforeOne.classList.remove("date-animation");
        }, 300)
    } else {
        if (lastAction == "random") {
            if (useMinViewsBox.checked) {
                getRandomResponse();
            }
        } else {
            getResponse(useMinViewsBox.checked);
        }
    }
})

endDateField.addEventListener("input", () => {
    let oldEndDate = endDate;
    endDate = endDateField.value.split("-").join("");

    let date = new Date();
    let today = date.getFullYear() + "" + (date.getMonth() + 1).toString().padStart(2, "0") + date.getDate().toString().padStart(2, "0");

    if (parseInt(endDate) <= parseInt(startDate) || parseInt(endDate) > parseInt(today)) {
        endDateField.value = wikiDateToHtmlDate(oldEndDate);
        endDate = oldEndDate;
        endDateField.classList.add("date-animation");
        datePickerBeforeTwo.classList.add("date-animation");
        setTimeout(function () {
            endDateField.classList.remove("date-animation");
            datePickerBeforeTwo.classList.remove("date-animation");
        }, 300)
    } else {
        if (lastAction == "random") {
            if (useMinViewsBox.checked) {
                getRandomResponse();
            }
        } else {
            getResponse(useMinViewsBox.checked);
        }
    }
})

function wikiDateToHtmlDate(date) {
    let dateArr = date.split("");
    dateArr.splice(4, 0, "-");
    dateArr.splice(7, 0, "-");
    return dateArr.join("");
}

function getResponse(useMinViews, additive = false) {
    abortRunningProcesses();
    setSearchModeIndicator();
    lastAction = "search";

    let keyword = textField.value;
    let quantity = amount.value;
    if (additive) {
        quantity = parseInt(quantity) + parseInt(resultWrapper.childElementCount);
    }

    var url = "https://en.wikipedia.org/w/api.php";

    var params = {
        action: "opensearch",
        search: keyword,
        limit: quantity,
        namespace: "0",
        format: "json"
    };

    url = url + "?origin=*";
    Object.keys(params).forEach(function (key) { url += "&" + key + "=" + params[key]; });

    const ac = new AbortController;
    abortControllerList.push(ac);
    fetch(url, { signal: ac.signal })
        .then(function (response) {
            return response.json();
        })
        .then(async function (response) {
            if (!additive) {
                resultWrapper.innerHTML = "";
            }

            let nameArray = [];

            let iStart = additive ? resultWrapper.childElementCount : 0;

            if (!useMinViews) {
                for (let i = iStart; i < response[1].length; i++) {
                    createElement(response[1][i], "-", response[3][i])
                }
                return;
            }

            for (let i = iStart; i < response[1].length; i++) {
                const titleFormated = (response[1][i] + "").split(" ").join("_");

                if (!useMinViews) {
                    createElement(response[1][i], "-", response[3][i]);
                    continue;
                }

                nameArray.push({
                    title: response[1][i],
                    titleFormatted: titleFormated,
                    hrfe: response[3][i],
                    viewsPromise: getAmountOfViewsInPeriod(titleFormated)
                })
            }

            for (const element of nameArray) {
                let views = await element.viewsPromise;
                createElement(element.title, views, element.hrfe);
            }
        })
        .catch(function (error) {
            console.log(error);
        });
}

function getRandomResponse(resetWrapper = true) {
    abortRunningProcesses();
    setRandomModeIndicator();
    lastAction = "random";

    if (resetWrapper) {
        resultWrapper.innerHTML = "";
    }
    let quantity = amount.value;
    let min = minViews.value;
    let useMinViews = useMinViewsBox.checked;

    const ac = new AbortController;
    abortControllerList.push(ac);
    getRandomArticle(quantity, min, useMinViews, ac.signal);
}

function getRandomArticle(quantity, minViews, useMinViews, signal) {   
    var url = "https://en.wikipedia.org/w/api.php";

    var params = {
        action: "query",
        format: "json",
        list: "random",
        rnnamespace: "0",
        rnlimit: quantity
    };

    url = url + "?origin=*";
    Object.keys(params).forEach(function (key) { url += "&" + key + "=" + params[key]; });

    const ac = new AbortController;
    abortControllerList.push(ac);
    fetch(url, { signal: ac.signal })
        .then(function (response) {
            return response.json();
        })
        .then(async function (response) {
            var randoms = response.query.random;

            let nameArray = [];

            for (var r in randoms) {
                const titleFormated = (randoms[r].title + "").split(" ").join("_");

                if (!useMinViews) {
                    createElement(randoms[r].title, "-", "https://en.wikipedia.org/wiki/" + titleFormated);
                    continue;
                }

                nameArray.push({
                    title: randoms[r].title,
                    titleFormatted: titleFormated,
                    viewsPromise: getAmountOfViewsInPeriod(titleFormated)
                })


            }
            let correctAmount = 0;



            for (const element of nameArray) {
                let views = await element.viewsPromise;
                if (views > minViews) {
                    correctAmount++;
                    createElement(element.title, views, "https://en.wikipedia.org/wiki/" + element.titleFormatted);
                }
            }

            console.log("NOT ENOUGH VIEWS AMOUNT: " + (quantity - correctAmount));
            if (quantity - correctAmount > 0 && useMinViews && !signal.aborted) {
                const ac = new AbortController;
                abortControllerList.push(ac);
                getRandomArticle((quantity - correctAmount), minViews, true, ac.signal);
            }
        })
        .catch((error) => {
            console.log(error)
        });
}

function createElement(title, views, href) {
    if (resultWrapper.childElementCount >= 2000) {
        resultWrapper.removeChild(resultWrapper.firstElementChild);
    }

    const result = document.createElement("a");
    result.classList.add("result");
    result.href = href;
    result.target = "_blank";
    result.onmouseover = getPreview;
    result.onmouseout = out;

    const resultTitle = document.createElement("div");
    resultTitle.innerHTML = title;
    resultTitle.classList.add("result-title");

    const resultBody = document.createElement("div");
    resultBody.innerHTML = views.toLocaleString() + " views";
    resultBody.classList.add("result-body");

    result.appendChild(resultTitle);
    result.appendChild(resultBody);
    resultWrapper.appendChild(result);
}

async function getAmountOfViewsInPeriod(article) {
    let amountURL = "https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/en.wikipedia/all-access/all-agents/" + article + "/daily/" + startDate + "/" + endDate;

    try {
        const ac = new AbortController;
        abortControllerList.push(ac);
        const response = await fetch(amountURL, { signal: ac.signal });
        const jsonData = await response.json().catch();
        let views = 0;
        for (let i = 0; i < jsonData["items"].length; i++) {
            views += jsonData["items"][i]["views"];
        }
        return views;
    } catch {
        return 0;
    }
}

function abortRunningProcesses() {
    abortControllerList.forEach((ac) => {
        ac.abort();
    })
    abortControllerList = [];
    abortControllerListSummary.forEach( ac => {
        ac.abort();
    })
}

function hourglassClick() {
    getResponse(useMinViewsBox.checked);
}

const summarySingleton = document.getElementById("summary-wrapper");
const arrowSingleton = document.getElementById("summary-arrow");
const summaryTextSingleton = summarySingleton.childNodes[1];
const summaryImgSingleton = summarySingleton.childNodes[3];
let abortControllerListSummary = [];

function getPreview(e) {
    const url = "https://en.wikipedia.org/api/rest_v1/page/summary/" + e.srcElement.href.substring(30);
    const ac = new AbortController;
    abortControllerListSummary.push(ac);
    fetch(url, { signal: ac.signal })
        .then(function (response) {
            return response.json();
        })
        .then(async function (response) {
            let bounds = e.srcElement.getBoundingClientRect();
            createSummary(response, bounds);
        })
        .catch((error) => {
            console.log(error)
        });
}

function out() {
    abortControllerListSummary.forEach((ac) => {
        ac.abort();
    });
    summarySingleton.className = "";
    arrowSingleton.className = "";

    summarySingleton.style.top = null;
    summarySingleton.style.bottom = null;
    summarySingleton.style.left = null;
    summarySingleton.style.right = null;

    arrowSingleton.style.top = null;
    arrowSingleton.style.bottom = null;
    arrowSingleton.style.left = null;
    arrowSingleton.style.right = null;
    
    summarySingleton.style.display = "none";
    arrowSingleton.style.display = "none";
    
    summaryImgSingleton.style.display = "none";
}

function createSummary(response, bounds) {
    summarySingleton.classList.add("summaryWrapper")

    if (window.innerHeight / 2 > bounds.top) {
        summarySingleton.style.top = "calc(" + (bounds.y + bounds.height) + "px + 1.4rem)";
        summarySingleton.classList.add("summary-bottom");

        arrowSingleton.classList.add("summary-arrow-top");
        arrowSingleton.style.top = "calc(" + (bounds.y + bounds.height) + "px + 1px)";
    } else {
        summarySingleton.style.bottom = "calc(" + (window.innerHeight - bounds.top) + "px + 1.4rem)";
        summarySingleton.classList.add("summary-top");

        arrowSingleton.classList.add("summary-arrow-bottom");
        arrowSingleton.style.bottom = "calc(" + (window.innerHeight - bounds.top) + "px + 1px)";
    }

    arrowSingleton.style.left = "calc(" + bounds.x + "px + 1rem)";

    summarySingleton.style.left = "calc(" + bounds.x + "px - 0.2rem)";
    summarySingleton.style.width = "calc(" + bounds.width + "px - 1.6rem)";
    summarySingleton.style.height = bounds.height + "px";

    summaryTextSingleton.innerHTML = response.extract;
    summaryTextSingleton.classList.add("summary-text");

    if (response.thumbnail) {
        summaryImgSingleton.src = response.thumbnail.source;
        summarySingleton.classList.add("summary-img-wrapper");
        summaryImgSingleton.style.display = "block";
    }

    summarySingleton.style.display = "block";
    arrowSingleton.style.display = "block";
}

for(let i = 0; i < 20; i++){
    for(let j = 0; j < 20; j++){
        randomModeText += "RANDOM ";
        searchModeText += "SEARCH ";
    }
    randomModeText += "\n";
    searchModeText += "\n";
}

function setRandomModeIndicator(){
    modeIndicator.innerHTML = randomModeText;
    modeIndicator.classList.remove("indicator-search-mode");
    modeIndicator.classList.add("indicator-random-mode");
}

function setSearchModeIndicator(){
    modeIndicator.innerHTML = searchModeText;
    modeIndicator.classList.remove("indicator-random-mode");
    modeIndicator.classList.add("indicator-search-mode");
}