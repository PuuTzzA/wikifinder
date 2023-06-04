let randomArticle = document.getElementById("randomArticle");
let textField = document.getElementById("textField");
let amount = document.getElementById("quantity");
let minViews = document.getElementById("minViews");
let useMinViewsBox = document.getElementById("useMinViews");
let resultWrapper = document.getElementById("resultWrapper");
let startDateField = document.getElementById("startDate");
let endDateField = document.getElementById("endDate");


let lastAction = "random";
let abortControllerList = [];
let startDate = "20220101";
let endDate = "20220201"

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

    if (parseInt(endDate) < parseInt(startDate)) {
        startDateField.value = wikiDateToHtmlDate(oldStartDate);
        startDate = oldStartDate;
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

    if (parseInt(endDate) < parseInt(startDate) || parseInt(endDate) > parseInt(today)) {
        endDateField.value = wikiDateToHtmlDate(oldEndDate);
        endDate = oldEndDate;
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

function getResponse(useMinViews) {
    abortRunningProcesses();
    lastAction = "search";

    let keyword = textField.value;
    let quantity = amount.value;

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
            resultWrapper.innerHTML = "";

            let nameArray = [];

            if (!useMinViews) {
                for (let i = 0; i < response[1].length; i++) {
                    createElement(response[1][i], "-", response[3][i])
                }
                return;
            }

            for (let i = 0; i < response[1].length; i++) {
                const titleFormated = (response[1][i] + "").split(" ").join("_");

                if (!useMinViews) {
                    createElement(response[1][i], "-", "https://en.wikipedia.org/wiki/" + titleFormated);
                    continue;
                }

                nameArray.push({
                    title: response[1][i],
                    titleFormatted: titleFormated,
                    viewsPromise: getAmountOfViewsInPeriod(titleFormated)
                })
            }

            for (const element of nameArray) {
                let views = await element.viewsPromise;
                createElement(element.title, views, "https://en.wikipedia.org/wiki/" + element.titleFormatted);
            }
        })
        .catch(function (error) {
            console.log(error);
        });
}

function getRandomResponse() {
    abortRunningProcesses();
    lastAction = "random";

    resultWrapper.innerHTML = "";
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

            console.log("ERROR AOUNT: " + (quantity - correctAmount));
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
    if (resultWrapper.childElementCount >= amount.value) {
        return;
    }

    const result = document.createElement("a");
    result.classList.add("result");
    result.href = href;
    result.target = "_blank";

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
}