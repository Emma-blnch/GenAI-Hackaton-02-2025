/* Menu burger */
window.addEventListener('DOMContentLoaded', () => {
    const burgerMenu = document.getElementById('burger-menu');
    const dropdownMenu = document.getElementById('dropdown-menu');
    const dashboardContent = document.getElementById('dashboard-content');
    const analyzeContent = document.getElementById('analyze-content');
    const whatIsAnalyzed = document.querySelector('.what-is-analyzed');  // ✅ Ajout de cette ligne

    // Ouvrir/fermer le menu burger
    burgerMenu.addEventListener('click', () => {
        dropdownMenu.classList.toggle('hidden');
    });

    // Navigation vers le Dashboard
    document.getElementById('dashboard-btn').addEventListener('click', () => {
        dashboardContent.classList.remove('hidden');
        analyzeContent.classList.add('hidden');
        whatIsAnalyzed.classList.add('hidden');   // ✅ Masquer la section "Je veux analyser"
        dropdownMenu.classList.add('hidden');
    });

    // Navigation vers la page d'Analyse
    document.getElementById('analyze-btn').addEventListener('click', () => {
        dashboardContent.classList.add('hidden');
        analyzeContent.classList.remove('hidden');
        whatIsAnalyzed.classList.remove('hidden');  // ✅ Afficher la section "Je veux analyser"
        dropdownMenu.classList.add('hidden');
    });

    // Par défaut, afficher le Dashboard
    dashboardContent.classList.remove('hidden');
    analyzeContent.classList.add('hidden');
    whatIsAnalyzed.classList.add('hidden');  // ✅ Masquer par défaut au chargement de la page

    // Gestion des boutons "Plusieurs articles" et "Un article"
    document.getElementById('several-articles').addEventListener('click', () => {
        document.getElementById('multi-article-content').classList.remove('hidden');
        document.getElementById('single-article-content').classList.add('hidden');
    });

    document.getElementById('one-article').addEventListener('click', () => {
        document.getElementById('multi-article-content').classList.add('hidden');
        document.getElementById('single-article-content').classList.remove('hidden');
    });
});

/* Changer page selon bouton */
document.getElementById('several-articles').addEventListener('click', () => {
    document.querySelector('.container').classList.remove('hidden');
    document.querySelector('.how-it-works').classList.remove('hidden');
    document.querySelector('.divider').classList.remove('hidden');
    document.querySelector('.ai-chatting').classList.add('hidden');
    document.querySelector('.dashboard').classList.add('hidden');

    document.getElementById('several-articles').classList.add('active');
    document.getElementById('one-article').classList.remove('active');
});

document.getElementById('one-article').addEventListener('click', () => {
    document.querySelector('.container').classList.add('hidden');
    document.querySelector('.how-it-works').classList.add('hidden');
    document.querySelector('.divider').classList.add('hidden');
    document.querySelector('.ai-chatting').classList.remove('hidden');

    document.getElementById('one-article').classList.add('active');
    document.getElementById('several-articles').classList.remove('active');
});

/* Enlever phrase du chatbot quand on écrit */
const textarea = document.getElementById('user-input');

// Lorsque l'utilisateur clique dans la zone de texte
textarea.addEventListener('focus', () => {
    textarea.placeholder = '';
});
// Lorsque l'utilisateur quitte la zone de texte sans rien écrire
textarea.addEventListener('blur', () => {
    if (textarea.value.trim() === '') {
        textarea.placeholder = "Copiez l'article à analyser ici";
    }
});

/* Requete vers API */
async function sendMessageToAI() {
    const userMessage = document.getElementById('user-input').value;

    try {
        const payload = JSON.stringify({ message: userMessage });

        const response = await fetch('https://6n9kl3vvv8.execute-api.us-west-2.amazonaws.com/dev', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: payload
        });

        const data = await response.json();

        if (data.body) {
            const parsedBody = JSON.parse(data.body);
            document.getElementById('ai-response').innerText = parsedBody.reply || parsedBody.error;
        } else {
            document.getElementById('ai-response').innerText = 'Aucune réponse reçue.';
        }
    } catch (error) {
        document.getElementById('ai-response').innerText = 'Une erreur est survenue. Veuillez réessayer.';
    }
}

/* Envoyer PDF a S3 */
document.getElementById('fileInput').addEventListener('change', function () {
    const file = this.files[0];
    const fileNameDisplay = document.getElementById('fileName');

    if (file) {
        fileNameDisplay.textContent = `Fichier sélectionné : ${file.name}`; // Affiche le nom du fichier
    } else {
        fileNameDisplay.textContent = ''; // Efface le texte si aucun fichier sélectionné
    }
});

document.getElementById('uploadBtn').addEventListener('click', async () => {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];

    if (!file) {
        document.getElementById('uploadStatus').innerText = 'Veuillez sélectionner un fichier PDF.';
        return;
    }

    const reader = new FileReader();
    reader.onload = async function () {
        const base64File = reader.result.split(',')[1];

        try {
            const response = await fetch('https://cdmjon52vg.execute-api.us-west-2.amazonaws.com/dev', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ body: base64File, isBase64Encoded: true })
            });

            const data = await response.json();
            document.getElementById('uploadStatus').innerText = data.result || 'Fichier stocké';
        } catch (error) {
            console.error('Erreur:', error);
            document.getElementById('uploadStatus').innerText = 'Erreur lors de l’envoi du fichier.';
        }
    };

    reader.readAsDataURL(file);
});

/* Recup json analyse */
async function checkAnalysisResult(fileName) {
    const resultUrl = `https://store-pdf-bucket.s3.us-west-2.amazonaws.com/results/${fileName.replace('.pdf', '_analysis.json')}`;

    try {
        const response = await fetch(resultUrl);
        if (response.ok) {
            const data = await response.json();
            console.log("✅ Résultats de l'analyse :", data);
            
            // Affiche les résultats dans un élément HTML (à créer)
            document.getElementById('analysisResults').innerText = JSON.stringify(data, null, 2);
        } else {
            console.log('⏳ Analyse en cours, nouvelle tentative dans 5s...');
            setTimeout(() => checkAnalysisResult(fileName), 5000); // Relance après 5 secondes
        }
    } catch (error) {
        console.error('❌ Erreur lors de la récupération des résultats :', error);
    }
}

/* Recupérer data excel sheet et l'analyser */
window.onload = function () {
    const excelUrl = 'https://store-pdf-bucket.s3.us-west-2.amazonaws.com/Data.xlsx';

    fetch(excelUrl)
        .then(response => response.arrayBuffer())
        .then(data => {
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(sheet);

            generateVisualizations(jsonData);
        })
        .catch(error => console.error('Erreur lors du chargement des données Excel :', error));
};

function generateVisualizations(data) {
    const sentiments = { Positif: 0, Négatif: 0, Factuel: 0 };
    const themeSentiments = {};
    const territorySentiments = { 'Nord': { Positif: 0, Négatif: 0, Factuel: 0 }, 'Pas-de-Calais': { Positif: 0, Négatif: 0, Factuel: 0 } };

    data.forEach(article => {
        const sentiment = article['Qualité du retour'] || 'Inconnu';
        const theme = article['Thème'] || 'Divers';
        let territory = article['Territoire'] || 'Non défini';

        // Compter les sentiments globaux
        sentiments[sentiment] = (sentiments[sentiment] || 0) + 1;

        // 📊 Compter les sentiments par thème
        if (!themeSentiments[theme]) {
            themeSentiments[theme] = { Positif: 0, Négatif: 0, Factuel: 0 };
        }
        themeSentiments[theme][sentiment] += 1;

        // 📍 Regrouper uniquement Nord / Pas-de-Calais (ignorer les autres départements)
        territory = territory.toLowerCase();
        if (territory.includes('nord')) {
            territory = 'Nord';
        } else if (territory.includes('pas-de-calais')) {
            territory = 'Pas-de-Calais';
        } else {
            return; // Ignore les autres départements
        }

        territorySentiments[territory][sentiment] += 1;
    });

    // 📊 Barres par Thème
    const themes = Object.keys(themeSentiments);
    const positifData = themes.map(t => themeSentiments[t].Positif);
    const negatifData = themes.map(t => themeSentiments[t].Négatif);
    const factuelData = themes.map(t => themeSentiments[t].Factuel);

    new Chart(document.getElementById('themeBarChart'), {
        type: 'bar',
        data: {
            labels: themes,
            datasets: [
                { label: 'Positif', data: positifData, backgroundColor: '#4CAF50' },
                { label: 'Négatif', data: negatifData, backgroundColor: '#F44336' },
                { label: 'Factuel', data: factuelData, backgroundColor: '#FFC107' }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Sentiments par Thème'
                }
            },
            scales: {
                x: { stacked: true },
                y: { stacked: true }
            }
        }
    });

    // 📍 Analyse par Territoire (seulement Nord et Pas-de-Calais)
    const territories = Object.keys(territorySentiments);
    new Chart(document.getElementById('territoryChart'), {
        type: 'bar',
        data: {
            labels: territories,
            datasets: [
                { label: 'Positif', data: territories.map(t => territorySentiments[t].Positif), backgroundColor: '#4CAF50' },
                { label: 'Négatif', data: territories.map(t => territorySentiments[t].Négatif), backgroundColor: '#F44336' },
                { label: 'Factuel', data: territories.map(t => territorySentiments[t].Factuel), backgroundColor: '#FFC107' }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Sentiments par Département (Nord / Pas-de-Calais)'
                }
            },
            scales: {
                x: { stacked: true },
                y: { stacked: true }
            }
        }
    });
}
