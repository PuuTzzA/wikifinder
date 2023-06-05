let minViewsLabel = document.getElementById("minViewsLabel");
let quantityLabel = document.getElementById("quantityLabel");
let finalOptionsWrapper = document.getElementsByClassName("final-options-wrapper")[0];
let optionsWrapper = document.getElementsByClassName("search-parameters-wrapper")[0];
let wikiGoogleLogo = document.getElementsByClassName("google-wiki-logo-wrapper")[0];

function resize() {
    let amountOfResults = Math.max(Math.floor(resultWrapper.clientWidth / 500), 1);
    let newStyle = "";
    for (let i = 0; i < amountOfResults; i++) {
        newStyle += " 1fr";
    }
    resultWrapper.style.gridTemplateColumns = newStyle;
    resultWrapper.style.paddingTop = "calc(" + optionsWrapper.clientHeight + "px + 1.5rem)";

    if (resultWrapper.clientWidth < 800) {
        startDateField.classList.add("hide-date");
        endDateField.classList.add("hide-date");
        minViewsLabel.innerHTML = "min";
        quantityLabel.innerHTML = "num";
        textField.style.width = "25vw";

        amount.classList.add("num-hide-arrows");
        minViews.classList.add("num-hide-arrows");
    } else {
        startDateField.classList.remove("hide-date");
        endDateField.classList.remove("hide-date");
        minViewsLabel.innerHTML = "Min Views: ";
        quantityLabel.innerHTML = "Amount: ";
        textField.style.width = "40vw";

        amount.classList.remove("num-hide-arrows");
        minViews.classList.remove("num-hide-arrows");
    }

    numberInputRightSize(amount);
    numberInputRightSize(minViews);

    if (resultWrapper.clientWidth < 400){
        minViewsLabel.innerHTML = "";
        document.getElementsByClassName("date-wrapper")[0].style.gridTemplateColumns = "auto max-content max-content";
        document.getElementsByClassName("date-wrapper")[1].style.gridTemplateColumns = "auto max-content 0";
    } else{
        document.getElementsByClassName("date-wrapper")[0].style.gridTemplateColumns = "auto max-content auto";
        document.getElementsByClassName("date-wrapper")[1].style.gridTemplateColumns = "auto max-content auto";
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
    numberInputRightSize(amount);
})

minViews.addEventListener("input", () => {
    numberInputRightSize(minViews);
})

function numberInputRightSize(field){
    if (field.classList.contains("num-hide-arrows")){
        field.style.width = (("" + field.value).length) * 8.8 + "px";
    } else{
        field.style.width = (("" + field.value).length + 2.5) * 8.8 + "px";
    }
}

document.addEventListener('DOMContentLoaded', function() {
    resize();
}, false);

document.getElementsByClassName("date-picker-before")[0].addEventListener("click", ()=>{
    startDateField.showPicker();
})

document.getElementsByClassName("date-picker-before")[1].addEventListener("click", ()=>{
    endDateField.showPicker();
})