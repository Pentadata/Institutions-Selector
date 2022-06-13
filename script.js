/*
 * @author: Pentadata, Inc
 * @see pentadatainc.com
 * This file is licensed under the MIT License:
 * you can merge, publish, sublicence, sell this software with inclusion of
 * this permission notice.
 * Full text license available at https://opensource.org/licenses/MIT.
*/


/*
 * This widget assumes to be run in a frontend application
 * that communicates with a web API (hereafter, 'the backend').
 * The backend is responsible
 * for all communication with the Pentadata APIs (since it requires
 * exchange of confidential API keys).
 *
 * The widget expects to receive from the backend bank-login URLs,
 * as well as institution lists. The backend obtains those from the
 * Pentadata APIs (@see https://www.pentadatainc.com/docs/introduction/overview/).
 *
 * This code also assumes that the communication between the widget
 * and the backend is secured by a 'Bearer' header with a Json Web Token value.
*/


// Change these values with the backend's.
// * APP_HOST
// * APP_PORT
// * ACCOUNT_LINK_ENDPOINT the backend endpoint to generate a bank-login url
// * INSTITUTION_SEARCH_ENDPOINT the backend endpoint to search institutions
const APP_HOST = 'http://localhost'
const APP_PORT = '5001'
const ACCOUNT_LINK_ENDPOINT = 'link'
const INSTITUTIONS_SEARCH_ENDPOINT = 'institutions'

// Set the variable below after user login, to authenticate
// requests to the backend.
const JWT = null

// The widget default state shows some of the top US banks.
// Change these values if you want to modify it.
const defaultBanks = [
    {
        "id": "chase",
        "name": "Chase",
        "logo": "assets/chase.svg",
    },
    {
        "id": "wells_fargo",
        "name": "Wells Fargo",
        "logo": "assets/wells_fargo.svg",
    },
    {
        "id": "pnc_bank",
        "name": "PNC Bank",
        "logo": "assets/pnc.svg",
    },
    {
        "id": "capital_one",
        "name": "Capital One",
        "logo": "assets/capital_one.svg",
    },
    {
        "id": "bank_of_america",
        "name": "Bank Of America",
        "logo": "assets/bank_of_america.svg",
    },
    {
        "id": "citibank",
        "name": "Citibank",
        "logo": "assets/citibank.svg",
    },
    {
        "id": "td_bank",
        "name": "TD Bank",
        "logo": "assets/td_bank.svg",
    },
    {
        "id": "us_bank",
        "name": "US Bank",
        "logo": "assets/us_bank.svg",
    },
]

// DO NOT MODIFY.
// These IDs are found in index.html
const bankSelectEl = document.getElementById('bank-select')
const messageEl = document.getElementById('message-container')
const searchText = document.getElementById('search-text').value
const setMessage = (message) => {
    messageEl.innerHTML = `<div class="message">${message}</div>`
}
const setError = (message) => {
    messageEl.innerHTML = `<div class="message error-text">${message}</div>`
}
const resetMessage = () => {
    messageEl.innerHTML = ''
}

// Set the default headers for requests.
// NOTE: The assumption is that widget users authenticate via Bearer token.
//       If the authentication scheme is different, change the headers in
//       the function below.
const getHeaders = () => {
    const headers = new Headers({
        'content-type': 'application/json'
    })
    if (JWT) {
        headers.set('Authorization', `Bearer ${JWT}`)
    }
    return headers
}


// Run a request to backend
// to generate a URL for a bank-login.
// Backend should query the Pentadata APIs to get the
// URL and then propagate it to this widget.
// The widget will open the URL in a new tab/window.
const fetchAccountLink = async (bankId) => {
    resetMessage()
    try {
        const url = `${APP_HOST}:${APP_PORT}/${ACCOUNT_LINK_ENDPOINT}`
        const res = await fetch(url, {
            method: 'post',
            headers: getHeaders(),
            body: JSON.stringify({
                bank: bankId
            })
        })
        if (res.status !== 200 || res.status !== 201) {
            setError('Request error')
            return null
        }
        const data = await res.json()
        if (data.url) {
            window.open(data.url, '_blank')
        } else {
            setError('Request error')
        }
    }
    catch(e) {
        console.log('Error fetching banks >> ', e)
        setError('Request error')
        return null
    }
}


// GET institutions list from backend.
// NOTE:
// This function assumes the backend returns a JSON key
// *institutions* with an array in the same format as {@link defaultBanks}.
const fetchBanks = async (query) => {
    resetMessage()
    try {
        const url = `${APP_HOST}:${APP_PORT}/${INSTITUTIONS_SEARCH_ENDPOINT}?q=${query}`
        const res = await fetch(url, {
            method: 'get',
            headers: getHeaders()
        })
        if (res.status !== 200 || res.status !== 201) {
            setError('Request error')
            return null
        }
        const data = await res.json()
        return data.institutions
    }
    catch(e) {
        console.log('Error fetching banks >> ', e)
        setError('Request error')
        return null
    }
}

// Render search results in the widget.
const setSearchBanks = (banks) => {
    if (!banks?.length) {
        setMessage('No institutions found, try another search.')
    }
    const bankList = banks.map((bank, index) =>  {
        return `
            <div
                onclick="fetchAccountLink('${bank.id}')"
                class="bank-select-row fade-up"
                key="${index}"
            >
                ${bank.logo
                    ? `<img src="${bank.logo}"/>`
                    : `<img class="default-logo" src="assets/bank_logo.svg"`
                }
                <span>${bank.name}</span>
            </div>
        `
    }).join("")
    bankSelectEl.innerHTML = bankList
}

const initDefaultBanks = () => {
    resetMessage()
    const mapTiles = defaultBanks.map((bank, index) => {
        return `
            <div class="bank-icon" key="${index}">
                <img
                    onclick="fetchAccountLink('${bank.id}')"
                    class="fade-up"
                    src="${bank.logo}"
                />
            </div>
        `
    }).join("")
    bankSelectEl.innerHTML = `
        <div class="bank-select-tiles">
            ${mapTiles}
        </div>
    `
}

const handleSearch = async () => {
    if (!searchText) {
        initDefaultBanks()
        return
    }
    if (searchText.length < 2) {
        setError('Search must be at least 1 character')
        return
    }
    setMessage('Loading..')
    const banks = await fetchBanks(searchText)
    if (!banks) {
        setError('Problem with search, please try search again.')
        return
    }
    setSearchBanks(banks)
}

initDefaultBanks()
