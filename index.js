import {
    getToken,
    getBlocks,
    checkSequence,
    checkFullSequence,
} from './services.js';

const init = async () => {
    const { token } = await getToken();
    const { data: blocks } = await getBlocks(token);
    check(blocks, token);
};

async function* correctBlockGenerator(initIx, blocks, token) {
    try {
        let j = 0;
        while (true) {
            const { message: value } = await checkSequence(
                [blocks[initIx], blocks[j + 1]],
                token
            );
            if (value) {
                return j + 1;
            }
            j++;
        }
    } catch (err) {
        console.log('err: ', err);
    }
}

async function* blocksGenerator(blocks, token) {
    let i = 0;
    let tempBlocks = [...blocks];

    while (i < tempBlocks.length - 1) {
        const correctBlockIndex = await correctBlockGenerator(
            i,
            tempBlocks,
            token
        ).next();

        [tempBlocks[i + 1], tempBlocks[correctBlockIndex.value]] = [
            tempBlocks[correctBlockIndex.value],
            tempBlocks[i + 1],
        ];
        i++;
    }
    return tempBlocks;
}

async function sortBlocks(blocks, token) {
    const { value } = await blocksGenerator(blocks, token).next();
    return value;
}

async function check(blocks, token) {
    // Check if the original blocks are valid
    console.log('Checking blocks...');
    const { message: areBlocksValid } = await checkFullSequence(blocks, token);
    if (areBlocksValid) {
        // If is true, return the blocks
        return blocks;
    } else {
        // If is false, call the sort method
        console.log('Starting sorting phase...');
        console.log(blocks);
        const newBlocksArray = await sortBlocks(blocks, token);
        // check the new array of blocks
        const { message: areBlocksValid } = await checkFullSequence(
            newBlocksArray,
            token
        );
        // If is true, return the new array
        if (areBlocksValid) {
            console.log('Retrieving ordered array...');
            console.log(newBlocksArray);
            return newBlocksArray;
        }
        // If is false, something went wrong
        throw new Error('Whoops!');
    }
}

init();
