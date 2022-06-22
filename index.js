const EMAIL = '';
const GET_TOKEN_URL = `https://rooftop-career-switch.herokuapp.com/token?email=${EMAIL}`;
const GET_BLOCKS_URL =
    'https://rooftop-career-switch.herokuapp.com/blocks?token=';
const CHECK_BLOCKS_URL =
    'https://rooftop-career-switch.herokuapp.com/check?token=';
/*
Body CHECK_BLOCKS_URL:
{
  "blocks" : [
    "...string...del...bloque...uno",
    "...string...del...bloque...dos"
  ]
}
--- or ---
{
  "encoded" : "...el...string...completo..."
}
*/

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
        let i = 0;
        while (true) {
            const { message: value } = await checkSequence(
                [blocks[initIx], blocks[i + 1]],
                token
            );
            console.log(value);
            if (value) {
                return blocks[i + 1];
            }
            i++;
        }
    } catch (err) {
        console.log('err: ', err);
    }
}

async function sortSequence(blocks, token) {
    let orderedArray = [blocks[0]];

    const correctBlock = await blocksIterator(
        orderedArray.length - 1,
        blocks,
        token
    ).next();
    orderedArray.push(correctBlock.value);

    console.log('orderedArray: ', orderedArray);
    // for await (const block of blocksIterator(
    //   orderedArray[orderedArray.length - 1],
    //   blocks,
    //   token
    // )) {
    //   console.log('block: ', block);
    // }

    // console.log(orderedArray);
}

async function check(blocks, token) {
    // Check if the original blocks are valid
    const { message: response } = await checkFullSequence(blocks, token);
    if (response) {
        return blocks;
    } else {
        console.log('Arreglo original:', blocks);
        sortSequence(blocks, token);
    }
    // return arrayOrdenado;
}

init();
