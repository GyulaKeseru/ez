document.addEventListener("DOMContentLoaded", function() {
    const recognizedText = document.getElementById("recognizedText");
    const translatedText = document.getElementById("translatedText");
    const detectedLang = document.getElementById("detectedLang");

    let recognition;
    let isListening = false;
    let detectedLanguage = "hu"; // Alapértelmezett magyar nyelv

    function startSpeechRecognition() {
        if (!recognition) {
            recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
            recognition.continuous = true; // Folyamatos hallgatás
            recognition.interimResults = false;
            recognition.lang = detectedLanguage; // Dinamikusan beállított nyelv

            recognition.onresult = function(event) {
                let speechResult = event.results[event.results.length - 1][0].transcript;
                recognizedText.value = speechResult;
                detectLanguage(speechResult);
            };

            recognition.onerror = function(event) {
                console.error("Hiba történt a beszédfelismerésben: ", event.error);
            };

            recognition.onend = function() {
                if (isListening) {
                    recognition.start(); // Automatikusan újraindul
                }
            };
        }

        if (!isListening) {
            recognition.start();
            isListening = true;
        }
    }

    // 🌍 Automatikus nyelvfelismerés (Google Translate API)
    function detectLanguage(text) {
        let url = `https://translate.googleapis.com/translate_a/single?client=gtx&dt=t&sl=auto&tl=en&q=${encodeURIComponent(text)}`;

        fetch(url)
            .then(response => response.json())
            .then(data => {
                detectedLanguage = data[2]; // Felismert nyelv
                detectedLang.textContent = detectedLanguage;
                recognition.lang = detectedLanguage; // Beszédfelismerés nyelve frissül
                translateText(text, detectedLanguage, "en"); // Angolra fordít
            })
            .catch(error => console.error("Nyelvfelismerési hiba:", error));
    }

    // 🌍 Fordítás célnyelvre (Google Translate API)
    function translateText(text, fromLang, toLang) {
        let url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${fromLang}&tl=${toLang}&dt=t&q=${encodeURIComponent(text)}`;

        fetch(url)
            .then(response => response.json())
            .then(data => {
                let translated = data[0][0][0];
                translatedText.value = translated;
                speakText(translated, toLang);
            })
            .catch(error => console.error("Fordítási hiba:", error));
    }

    // 🔊 Szöveg kimondása célnyelven (Text-to-Speech)
    function speakText(text, lang) {
        let utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;
        utterance.onend = function() {
            startSpeechRecognition(); // Automatikusan újraindítja a felismerést a válasz után
        };
        speechSynthesis.speak(utterance);
    }

    startSpeechRecognition(); // Az oldal betöltésekor automatikusan indul a beszédfelismerés
});
