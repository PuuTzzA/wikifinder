let minViewsLabel = document.getElementById("minViewsLabel");
let quantityLabel = document.getElementById("quantityLabel");
let finalOptionsWrapper = document.getElementsByClassName("final-options-wrapper")[0];
let optionsWrapper = document.getElementsByClassName("search-parameters-wrapper")[0];
let wikiGoogleLogo = document.getElementsByClassName("google-wiki-logo-wrapper")[0];

function resize() {
    let amount = Math.max(Math.floor(resultWrapper.clientWidth / 500), 1);
    let newStyle = "";
    for (let i = 0; i < amount; i++) {
        newStyle += " 1fr";
    }
    resultWrapper.style.gridTemplateColumns = newStyle;
    resultWrapper.style.paddingTop = "calc(" + optionsWrapper.clientHeight + "px + 1.5rem)";

    if (resultWrapper.clientWidth < 800) {
        startDateField.classList.add("hide-date");
        endDateField.classList.add("hide-date");
        minViewsLabel.innerHTML = "min";
        quantityLabel.innerHTML = "num";
        textField.style.width = "30vw";
    } else {
        startDateField.classList.remove("hide-date");
        endDateField.classList.remove("hide-date");
        minViewsLabel.innerHTML = "Min Views: ";
        quantityLabel.innerHTML = "Amount: ";
        textField.style.width = "40vw";
    }

    if (resultWrapper.clientWidth < 600){
        finalOptionsWrapper.style.gridTemplateColumns = "max-content";
    } else{
        finalOptionsWrapper.style.gridTemplateColumns = "max-content max-content";
    }

    if (resultWrapper.clientWidth < 1150){
        wikiGoogleLogo.style.display = "none";
    }else{
        wikiGoogleLogo.style.display = "grid";
    }
}

resize();

amount.addEventListener("input", () => {
    amount.style.width = (("" + amount.value).length + 2) * 8.8 + "px";
})

minViews.addEventListener("input", () => {
    minViews.style.width = (("" + minViews.value).length + 2) * 8.8 + "px";
})