// https://underscorejs.org/

// Underscore groupBy - REST Countries
// Räkna antal länder med över 10 miljoner invånare
fetchJSON("https://restcountries.com/v3.1/all?fields=cca2,population", function(countries) {
    const popSummary = _.countBy(countries, function(country) {
        return country.population > 10000000 ? 'above': 'below';
    });

    const res = `Found ${popSummary.above} countries with a population above 10 million, and ${popSummary.below} countries with less from a total of ${countries.length} countries.`;

    addResult(res);
});


// Underscore filter, sortBy - REST Countries
// Returnera namn på alla länder med mer än 5 miljoner invånare
// Sortera resultat i bokstavsordning
fetchJSON("https://restcountries.com/v3.1/all?fields=name,population", function(countries) {
    const largeCountries = _.filter(countries, function(country) {
        return country.population > 5000000;
    });

    const countryNames = largeCountries.map( (country) => country.name.common);
    const sortedCountries = _.sortBy(countryNames);
    
    const res = `<h2>${sortedCountries.length} countries with a population larger than 5 million:</h2><div>${sortedCountries.join("<br>")}</div>`;
    addResult(res);
});

// Underscore groupBy, partition - REST Countries
// Gruppera spansktalande länder utifrån subregion
// Dela upp spansktalande länder i FN-medlemmar/Ej FN-medlemmar
fetchJSON("https://restcountries.com/v3.1/lang/Spanish?fields=name,population,subregion,unMember", function(countries) {

    countries.sort((a, b) => a.name.common.localeCompare(b.name.common));

    // Gruppera efter region
    const countriesByRegion = _.groupBy(countries, (country) => country.subregion);

    const resultsBox = document.createElement("div");
    const resultsTitle = document.createElement("h2");
    resultsTitle.innerText = "Spanish-speaking countries by region";
    resultsBox.appendChild(resultsTitle);
    
    for (const region in countriesByRegion) {
        const regionBox = document.createElement("div");
        const headingElem = document.createElement("h3");
        const countryList = document.createElement("ul");
        headingElem.innerText = region;
        for (const country of countriesByRegion[region]) {
            const countryItem = document.createElement("li");
            countryItem.innerText = country.name.common;
            countryList.appendChild(countryItem);
        }
        regionBox.append(headingElem, countryList);
        resultsBox.appendChild(regionBox);
    }
    addResult(resultsBox);

    // Gruppera efter FN-medlemskap
    const countriesByUNMembership = _.partition(countries, (country) => country.unMember );
    const memberResultsBox = document.createElement("div");

    for (let groupIdx = 0; groupIdx < countriesByUNMembership.length; groupIdx++) {
        const memberResultsList = document.createElement("ul");
        const memberResultsTitle = document.createElement("h2");
        memberResultsTitle.innerText = ( groupIdx == 0 ? "Spanish-speaking UN members" : "Spanish-speaking countries not UN members");
        memberResultsBox.append(memberResultsTitle, memberResultsList);
        for (let i = 0; i < countriesByUNMembership[groupIdx].length; i++) {
            const memberResultsItem = document.createElement("li");
            memberResultsItem.innerText = countriesByUNMembership[groupIdx][i].name.common;
            memberResultsList.appendChild(memberResultsItem)
        }
    }

    addResult(memberResultsBox);    
});


// Underscore each - REST Countries
// Lista alla länder som är FN-medlemmar
fetchJSON("https://restcountries.com/v3.1/all?fields=name,unMember", function(countries) {

    const membersList = [];
    const nonMembersList = [];

    _.each(countries, (country) => { 
         if (country.unMember) {
            membersList.push(country);
         }
         else {
            nonMembersList.push(country);
         }
    } );
    
    membersList.sort((a, b) => a.name.common.localeCompare(b.name.common));
    nonMembersList.sort((a, b) => a.name.common.localeCompare(b.name.common));

    let res = `<h2>${membersList.length} countries out of ${countries.length} are UN members:</h2><div>${membersList.map( (country) => country.name.common).join("<br>")}</div>`; 
    res += `<h2>${nonMembersList.length} Non-members:</h2><div>${nonMembersList.map( (country) => country.name.common).join("<br>")}</div>`;
    addResult(res);
});


async function fetchJSON(fetchURL, callbackFunc, errorFunc = errorHandler) {
    try {
        const response = await fetch(fetchURL);
        if (!response.ok)
            throw new ErrorWithCode(response.statusText, response.status);

        const result = await response.json();
        callbackFunc(result);
        return result;
    }
    catch (err) {
        errorFunc(err);
    }
}

function errorHandler(error) {
    console.error("API error", error);
}

function addResult(result) {
    const resultBox = document.querySelector("#resultbox");
    const resultLine = document.createElement("div");
    if (typeof result == "string") {
        resultLine.innerHTML = result;
    }
    else {
        resultLine.appendChild(result);
    }
    
    resultBox.appendChild(resultLine);
}
