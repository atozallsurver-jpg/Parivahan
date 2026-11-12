// ==UserScript==
// @name         Sarathi Simple Mobile Field Enabler
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Simple script to enable mobile number fields
// @author       You
// @match        https://sarathi.parivahan.gov.in/sarathiservice/submitMobUpdForm.do
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Run the enabler function
    function enableFields() {
        // Directly remove disabled attribute using multiple approaches
        document.querySelectorAll('input[id="newMobNum"], input[id="cnfMobNum"]').forEach(input => {
            input.disabled = false;
            input.removeAttribute('disabled');
            input.readOnly = false;
            input.style.backgroundColor = 'white';
            input.style.color = 'black';
        });

        // Also enable the proceed button
        const proceedBtn = document.getElementById('button1');
        if (proceedBtn) {
            proceedBtn.disabled = false;
            proceedBtn.removeAttribute('disabled');
        }
    }

    // Run on page load
    window.addEventListener('load', function() {
        // Run immediately
        enableFields();

        // Run again after a short delay
        setTimeout(enableFields, 2000);

        // Run every 3 seconds to catch any re-disabling
        setInterval(enableFields, 3000);
    });

    // Also run on any user interaction
    document.addEventListener('click', enableFields);
    document.addEventListener('keydown', enableFields);

})();