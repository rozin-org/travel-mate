document.addEventListener('DOMContentLoaded', () => {
        // 1. Get the URL parameters (Query String)
        const urlParams = new URLSearchParams(window.location.search);
        const resultsDiv = document.getElementById('resultsDisplay');
        
        // 2. Extract Radio Button Selection
        const selectedImage = urlParams.get('imageSelector'); // 'imageSelector' is the name of the radio group
        
        let htmlContent = '<h2>Main Image Selection:</h2>';
        if (selectedImage) {
            htmlContent += `<p>You selected the <strong>${selectedImage}</strong> image.</p>`;
        } else {
            htmlContent += `<p>No main image was selected (Error).</p>`;
        }

        // 3. Extract Checkbox Selections (Multiple selections are possible)
        // Use getAll() for checkboxes, as there might be more than one value for the same name.
        const highlightedImages = urlParams.getAll('alphaChecker'); // 'alphaChecker' is the name of the checkbox group

        htmlContent += '<h2>Highlighted Alpha Images:</h2>';
        if (highlightedImages.length > 0) {
            htmlContent += '<ul>';
            highlightedImages.forEach(img => {
                htmlContent += `<li>${img}</li>`;
            });
            htmlContent += '</ul>';
        } else {
            htmlContent += '<p>No alpha images were highlighted.</p>';
        }

        // 4. Display the results
        resultsDiv.innerHTML = htmlContent;
    });