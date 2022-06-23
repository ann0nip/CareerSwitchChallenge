const EMAIL = '';
const GET_TOKEN_URL = `https://rooftop-career-switch.herokuapp.com/token?email=${EMAIL}`;
const GET_BLOCKS_URL =
    'https://rooftop-career-switch.herokuapp.com/blocks?token=';
const CHECK_BLOCKS_URL =
    'https://rooftop-career-switch.herokuapp.com/check?token=';

const init = async () => {
    const { token } = await getToken();
    const { data: blocks } = await getBlocks(token);
    check(blocks, token);
};

async function getToken() {
    const response = await fetch(GET_TOKEN_URL);

    return await response.json();
}

async function getBlocks(token) {
    const response = await fetch(GET_BLOCKS_URL + token);

    return await response.json();
}

async function checkFullSequence(data, token) {
    const response = await fetch(CHECK_BLOCKS_URL + token, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            encoded: data.join(''),
        }),
    });

    return await response.json();
}

async function checkSequence(data, token) {
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

async function* blocksIterator(initIx, blocks, token) {
    try {
        let j = 0;
        while (true) {
            const { message: value } = await checkSequence(
                [blocks[initIx], blocks[j + 1]],
                token
            );
            if (value) {
                return { str: blocks[j + 1], ix: j + 1 };
            }
            j++;
        }
    } catch (err) {
        console.log('err: ', err);
    }
}

async function* blocksLoop(blocks, token) {
    let i = 0;

    let tempBlocks = [...blocks];
    while (i < tempBlocks.length - 1) {
        const correctBlock = await blocksIterator(i, tempBlocks, token).next();

        [tempBlocks[i + 1], tempBlocks[correctBlock.value.ix]] = [
            tempBlocks[correctBlock.value.ix],
            tempBlocks[i + 1],
        ];
        i++;
        // yield tempBlocks;
    }
    yield tempBlocks;
}

async function sortSequence(blocks, token) {
    for await (const value of blocksLoop(blocks, token)) {
        return value;
    }
}

async function check(blocks, token) {
    // Check if the original blocks are valid
    const { message: response } = await checkFullSequence(blocks, token);
    if (response) {
        // If is true, return the blocks
        return blocks;
    } else {
        // If is false, call the sort method
        const newBlocksArray = await sortSequence(blocks, token);
        // check the new array of blocks
        const { message: response } = await checkFullSequence(
            newBlocksArray,
            token
        );
        // If is true, return the new array
        if (response) {
            return newBlocksArray;
        }
        // If is false, something went wrong
        throw new Error('Whoops!');
    }
}

init();
