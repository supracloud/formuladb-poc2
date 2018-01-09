import * as _ from 'lodash';

let MESSAGES = [
    'T1/A1/->',
    'T1/A1/<-',
    'T1/A2/->',
    'T1/A2/<-',
    'T2/A1/->',
    'T2/A1/<-',
    'T2/A2/->',
    'T2/A2/<-',
];

console.log(_.toUpper("asdasdadadadsa"));
let tstmsgs = [
    'T1/A1/<-',
    'T1/A2/->',
    'T1/A2/<-',
    'T2/A1/->',
    'T2/A1/<-',
    'T2/A2/->',
];
console.log(_(MESSAGES).differenceWith(tstmsgs).value());
console.log(_(MESSAGES.map(m => str2msg(m))).differenceWith(tstmsgs.map(m => str2msg(m))).value());
let t2msgs = _.clone(tstmsgs);
console.log("cloning works? ", t2msgs === tstmsgs, t2msgs[0] === tstmsgs[0]);

interface Msg {
    msg: string;
    trans: string;
    object: string;
    isReply: boolean;

}


function getReqOf(reply: Msg): Msg {
    if (reply.isReply === false) {
        throw new Error(this.msg + " is  not a Request message");
    }
    return { msg: reply.trans + "/" + reply.object + "/->", trans: reply.trans, object: reply.object, isReply: false } as Msg;
}

function str2msg(msgStr: string) {
    let str = msgStr.split('/');
    return { msg: msgStr, trans: str[0], object: str[1], isReply: (str[2] === '<-') } as Msg;
}

function isMessageAllowedFor(combination: string[], newMsg: string) {
    if (isCombinationComplete(combination)) {
        console.log("combination ", combination, "is complete");
        return false;
    }
    let newM = str2msg(newMsg);
    let ret = true;
    combination.map(m => str2msg(m)).forEach(m => {
        if (newM.msg === m.msg) {
            console.log("not allowed: duplicate messages " + m.msg + ", " + newM.msg);
            ret = false;
        }
        else if (newM.trans === m.trans && newM.object === m.object && !newM.isReply) {
            console.log("not allowed: request " + m.msg + " after reply " + newM.msg + newM.isReply + m.isReply);
            ret = false;
        } else if (newM.isReply) {
            if (!combination.find(m => m === getReqOf(newM).msg)) {
                console.log("not allowed: reply message " + newM.msg + " without a request message already in combination " + combination.join(", "));
                ret = false;
            }
        }
    });

    return ret;
}

function isCombinationComplete(combination: string[]): boolean {
    return combination.length == MESSAGES.length;
}

function generateCombinations(combination: string[]) {
    console.log("working on combination: " + combination.join(', '));
    if (isCombinationComplete(combination)) {
        console.log("POSSIBLE COMBINATION: " + combination.join(', '));
    }
    if (combination.length < MESSAGES.length) {
        let possibleNewElements = _(MESSAGES).differenceWith(combination);
        //get all elements
        possibleNewElements.forEach(e => {
            if (isMessageAllowedFor(combination, e)) {
                let newCombination = _.clone(combination);
                newCombination.push(e);
                generateCombinations(newCombination);
            }
        });
    }
}

generateCombinations([]);
