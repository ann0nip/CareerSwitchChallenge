import fetch from 'node-fetch';

const EMAIL = process.env.EMAIL;
const GET_TOKEN_URL = `https://rooftop-career-switch.herokuapp.com/token?email=${EMAIL}`;
const GET_BLOCKS_URL =
    'https://rooftop-career-switch.herokuapp.com/blocks?token=';
const CHECK_BLOCKS_URL =
    'https://rooftop-career-switch.herokuapp.com/check?token=';

export async function getToken() {
    try {
        const response = await fetch(GET_TOKEN_URL);

        if (response.ok) {
            return await response.json();
        } else {
            throw new Error(`Got response.status: ${response.status}`);
        }
    } catch (e) {
        console.log(e);
    }
}

export async function getBlocks(token) {
    try {
        const response = await fetch(GET_BLOCKS_URL + token);

        if (response.ok) {
            return await response.json();
        } else {
            throw new Error(`Got response.status: ${response.status}`);
        }
    } catch (e) {
        console.log(e);
    }
}

export async function checkFullSequence(blocks, token) {
    const response = await fetch(CHECK_BLOCKS_URL + token, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            encoded: blocks.join(''),
        }),
    });

    return await response.json();
}

export async function checkSequence(data, token) {
    const response = await fetch(CHECK_BLOCKS_URL + token, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            blocks: data,
        }),
    });
    return await response.json();
}
