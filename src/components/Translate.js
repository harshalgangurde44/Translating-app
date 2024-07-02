import React, { useEffect } from "react";
import countries from "../data";

const Translate = () => {
  useEffect(() => {
    const fromText = document.querySelector(".from-text");
    const toText = document.querySelector(".to-text");
    const exchangeIcon = document.querySelector(".exchange");
    const selectTags = document.querySelectorAll("select");
    const icons = document.querySelectorAll(".row i");
    const translateBtn = document.querySelector("button");

    // Populate select options with country codes
    selectTags.forEach((tag, id) => {
      for (let country_code in countries) {
        let selected =
          id === 0
            ? country_code === "en-GB"
              ? "selected"
              : ""
            : country_code === "hi-IN"
            ? "selected"
            : "";
        let option = `<option ${selected} value="${country_code}">${countries[country_code]}</option>`;
        tag.insertAdjacentHTML("beforeend", option);
      }
    });

    // Clear the toText value if fromText is empty
    fromText.addEventListener("keyup", () => {
      if (!fromText.value) {
        toText.value = "";
      }
    });

    // Translate text on button click
    translateBtn.addEventListener("click", () => {
      let text = fromText.value.trim();
      let translateFrom = selectTags[0].value;
      let translateTo = selectTags[1].value;
      if (!text) return;
      if (translateFrom === translateTo) {
        toText.value = text;
        return;
      }
      toText.setAttribute("placeholder", "Translating...");
      let apiUrl = `https://api.mymemory.translated.net/get?q=${text}&langpair=${translateFrom}|${translateTo}`;
      fetch(apiUrl)
        .then((res) => res.json())
        .then((data) => {
          toText.value = data.responseData.translatedText;
          if (Array.isArray(data.matches)) {
            data.matches.forEach((match) => {
              if (match.id === 0) {
                toText.value = match.translation;
              }
            });
          }
          toText.setAttribute("placeholder", "Translation");
        })
        .catch((error) => {
          console.error("Error fetching translation:", error);
          toText.setAttribute("placeholder", "Translation error");
        });
    });

    // Copy text or speak text on icon click
    icons.forEach((icon) => {
      icon.addEventListener("click", ({ target }) => {
        if (!fromText.value || !toText.value) return;
        if (target.classList.contains("fa-copy")) {
          if (target.id === "from") {
            navigator.clipboard.writeText(fromText.value);
          } else {
            navigator.clipboard.writeText(toText.value);
          }
        } else {
          let utterance;
          if (target.id === "from") {
            utterance = new SpeechSynthesisUtterance(fromText.value);
            utterance.lang = selectTags[0].value;
          } else {
            utterance = new SpeechSynthesisUtterance(toText.value);
            utterance.lang = selectTags[1].value;
          }
          speechSynthesis.speak(utterance);
        }
      });
    });

    // Exchange languages on exchange icon click
    const handleExchangeClick = () => {
      let tempLang = selectTags[0].value;
      selectTags[0].value = selectTags[1].value;
      selectTags[1].value = tempLang;

      let tempText = fromText.value;
      fromText.value = toText.value;
      toText.value = tempText;
    };

    exchangeIcon.addEventListener("click", handleExchangeClick);

    // Cleanup function to remove the event listener
    return () => {
      exchangeIcon.removeEventListener("click", handleExchangeClick);
    };
  }, []);

  return (
    <>
      <div className="container">
        <div className="wrapper">
          <div className="text-input">
            <textarea
              spellCheck="false"
              className="from-text"
              placeholder="Enter text"
            ></textarea>
            <textarea
              spellCheck="false"
              readOnly
              disabled
              className="to-text"
              placeholder="Translation"
            ></textarea>
          </div>
          <ul className="controls">
            <li className="row from">
              <div className="icons">
                <i id="from" className="fas fa-volume-up"></i>
                <i id="from" className="fas fa-copy"></i>
              </div>
              <select></select>
            </li>
            <li className="exchange">
              <i className="fas fa-exchange-alt"></i>
            </li>
            <li className="row to">
              <select></select>
              <div className="icons">
                <i id="to" className="fas fa-volume-up"></i>
                <i id="to" className="fas fa-copy"></i>
              </div>
            </li>
          </ul>
        </div>
        <button>Translate Text</button>
      </div>
    </>
  );
};

export default Translate;
