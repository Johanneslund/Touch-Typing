
// Fungerar som en konstruktor som initierar all funktionalitet
function start() {
    getXMLTexts();
    setLanguage();
    changePicker();
    textInput.setAttribute("readonly", true);

}

const textArea = document.getElementById("textarea");
const textTitle = document.getElementById("texttitle");
const author = document.getElementById("author");
const textPicker = document.getElementById("textpicker");
const textInput = document.getElementById("textinput");
const errors = document.getElementById("errors");
const errorPercentage = document.getElementById("errorpercentage");
const grossWpm = document.getElementById("grosswpm");
const netWpm = document.getElementById("netwpm");
const gameBtn = document.getElementById("startbutton");
const checkBox = document.getElementById("casing");
const checkSwe = document.getElementById("swedish");
const checkEng = document.getElementById("english");
const radioBtns = document.getElementsByName("radio");
const mute = document.getElementById("mute");

let textarray = new Array();
let arrayCounter = 0;
let startTime;
let errorCount = 0;
let spanCount = 0;
let wordCount = 1;
let selectedText;
let selectedTextArray;
let errorSound;


// Hämtar texterna från dokumentet texts.xml och lägger dessa i en array
function getXMLTexts() {

    let xml = new XMLHttpRequest();

    xml.onreadystatechange = function () {

        if (xml.readyState == 4) {
            if (xml.status == 200) {
                let parser = new DOMParser();
                let xmldoc = parser.parseFromString(xml.responseText, "text/xml");

                const texts = xmldoc.getElementsByTagName("author");
                console.log(texts);
                for (let i = 0; i < texts.length; i++) {
                    const element = texts[i];
                    let text = {

                        title: xmldoc.getElementsByTagName("title")[i].childNodes[0].nodeValue,
                        author: xmldoc.getElementsByTagName("author")[i].childNodes[0].nodeValue,
                        text: xmldoc.getElementsByTagName("text")[i].childNodes[0].nodeValue,
                        language: xmldoc.getElementsByTagName("language")[i].childNodes[0].nodeValue
                    }
                    textarray.push(text);
                }
            }
        }
    };
    xml.open('get', 'texts.xml', false);
    xml.send();
}

// Skapar span av varje tecken i en vald text
function setSpan(text) {


    textArea.innerHTML = "";
    for (let i = 0; i < text.length; i++) {
        const element = text[i];

        let span = document.createElement("span");
        span.textContent = element;
        span.id = i;
        span.classList.add("letter")

        textArea.appendChild(span);

        spanCount++;
        if (element == " ") {
            wordCount++;
        }
    }
}


// Väljer de olika texterna beroende på språk i textpickern
function setPicker(lang) {

    selectedTextArray = new Array();

    while (textPicker.options.length > 0) {
        textPicker.remove(0);
    }

    textarray.forEach(element => {
        if (element.language == lang) {
            selectedTextArray.push(element);
        }
    });

    for (let i = 0; i < selectedTextArray.length; i++) {
        const element = selectedTextArray[i].title;

        var option = document.createElement("option");
        option.textContent = element;
        option.value = element;
        option.id = i;
        option.classList.add("option");

        textPicker.appendChild(option);
    }

    setText(textPicker.value);
}


// Den funktion som sätter vilken text som ska gälla 
function setText(value) {

    wordCount = 1;
    spanCount = 0;
    errorCount = 0;
    const found = textarray.find(function (selectedtext) {
        return selectedtext.title == value
    })


    setSpan(found.text);
    clearStats();
    clearInput();
    textTitle.innerHTML = found.title;
    author.innerHTML = found.author + " ( " + wordCount + " ord, " + spanCount + " tecken)";
    arrayCounter = 0;
    resetPlayBtn();
}

// Funktion som sätter vilket språk som texterna ska ha
function setLanguage() {

    if (checkSwe.checked == true) {
        setPicker("swedish");
    }
    else {
        setPicker("english");
    }
}


// Startar själva spelet 
function startGame() {

    if (gameBtn.classList.contains("stopbutton")) {
        stopGame();
    }
    else {

        gameBtn.classList.add("stopbutton");
        gameBtn.classList.remove("playbutton");
        textInput.removeAttribute("readonly");
        setGame();
        clearStats();
    }
}

// Funktion som avslutar spelet
function finishGame() {
    clearWPMInterval();
    clearInput();
    resetPlayBtn();
    arrayCounter = 0;
}

// Stoppar spelet och börjar om på nytt
function stopGame() {

    resetPlayBtn();
    setText(textPicker.value);
    clearWPMInterval();

}

// Sätter play-knappen till standardläge
function resetPlayBtn() {

    textInput.setAttribute("readonly", true);
    gameBtn.classList.remove("stopbutton");
    gameBtn.classList.add("playbutton");

}

// Hämtar WPM
function getWPM() {

    let currentTime = Date.now();
    let elapsedTime = (currentTime - startTime) / 60000;
    let grossWPM = (arrayCounter / 5) / elapsedTime;
    let netWPM = grossWPM - ((errorCount / 5) / elapsedTime);

    setWPM(grossWPM, netWPM);

}

// Sätter WPM
function setWPM(gross, net) {

    netWpm.innerHTML = "Ord i minuten, med missar: " + Math.round(net);
    grossWpm.innerHTML = "Ord i minuten: " + Math.round(gross);

}

// Spelar upp ljud och checkar om ljud är aktiverat eller ej
function playSound() {

    if (mute.checked == true) {
        errorSound = new Audio("audio/no.mp3");
        errorSound.play();
    }
}

// Startar timer som uppdaterar statistiken
function setWPMInterval(){
    wpmTimer = setInterval(() => {
        getWPM(); setStats();
    }, 250);
}

// Stoppar uppdateringen av statistik
function clearWPMInterval(){
    clearInterval(wpmTimer);
}

// Sätter eventlistener till de olika valen i textpicker 
function changePicker() {

    const selectElement = document.querySelector('#textpicker');

    selectElement.addEventListener('change', (event) => {
        setText(selectElement.value);
    })
}



// Gör så att alla bokstäver blir vita, förutom den första som blir markerad. 
function setGame() {
    const letters = document.querySelectorAll(".letter");
    letters.forEach(element => {
        element.classList.remove("highlight");
        element.classList.remove("correct");
        element.classList.remove("incorrect");

    });
    letters[0].classList.add("highlight");

}


// Sätter antal fel och felprocent
function setStats() {
    let percent = (errorCount * 100) / arrayCounter;
    errors.innerHTML = "Antal fel: " + errorCount;

    errorPercentage.innerHTML = "Träffsäkerhet: " + Math.round(100 - percent) + "%"
}

// Tar bort texten i textinput
function clearInput() {

    textInput.value = "";
}

// Tar bort värden i stats
function clearStats() {
    errorPercentage.innerHTML = "Träffsäkerhet: ";
    errors.innerHTML = "Antal fel: "
    netWpm.innerHTML = "Ord i minuten, med missar: ";
    grossWpm.innerHTML = "Ord i minuten: ";
    startTime = null;
}


// Input-eventet, som kollar vilket input som finns och om det överensstämmer med det värde nuvarande tecken har. Här finns och funktionalitet för att igorera stor bokstav.
textInput.addEventListener('input', (event) => {

    if (startTime == null) {
        startTime = Date.now();
        setWPMInterval();
    }

    let input = event.data;

    let letters = document.querySelectorAll(".letter");
    i = arrayCounter;

    let letter = letters[i];
    let letterhtml = letter.innerHTML;

    if (input == " ") {
        clearInput();
    }

    if (checkBox.checked == true) {
        letterhtml = letterhtml.toLowerCase();
        input = input.toLowerCase();
    }

    if (arrayCounter + 1 == spanCount) {

        if (input == letterhtml) {
            letters[i].classList.remove("highlight");
            letters[i].classList.add("correct");

        }
        else {
            letters[i].classList.add("incorrect");
            letters[i].classList.remove("highlight");
            errorCount++;
            playSound();
        }
        finishGame();

    }
    else {
        letter.classList.add("highlight");

        if (input == letterhtml) {
            letters[i].classList.remove("highlight");
            letters[i].classList.add("correct");

        }
        else {
            letters[i].classList.add("incorrect");
            letters[i].classList.remove("highlight");
            errorCount++;
            playSound();
        }

        arrayCounter++;
        letters[arrayCounter].classList.add("highlight");

    }

})

// Klick-event för val av engelska texter
checkEng.addEventListener('change', function () {
    setLanguage();
});
//Klick-event för val av svenska texter
checkSwe.addEventListener('change', function () {
    setLanguage();
});
//Klick-event för start av spel
gameBtn.addEventListener('click', function () {
    startGame();
});
//Load-event som initierar start-funktionen
window.addEventListener("load", start(), false);