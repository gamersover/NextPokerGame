const CARDS_RANK = {
    '3': 1,
    '4': 2,
    '5': 3,
    '6': 4,
    '7': 5,
    '8': 6,
    '9': 7,
    '10': 8,
    'J': 9,
    'Q': 10,
    'K': 11,
    'A': 12,
    '2': 13,
    'XW': 14,   // 小王
    'DW': 15    // 大王
}

const NORMAL_CARDS = new Set(['3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A', '2'])
const SPECIAL_CARDS = new Set(['XW', 'DW'])
const COLORS = { '红桃': 'r1', '方块': 'r2', '梅花': 'b1', '黑桃': 'b2' }

const CardsType = {
    NOT_VALID: 0,
    DAN: 1,
    DUIZI: 2,
    FEIJI: 3,
    SHUNZI: 4,
    LIANDU: 5,
    ZHADAN: 6
}

const OutState = {
    PASS: 1,
    NO_CARDS: 2,
    VALID: 3
}


class CardsInfo {
    constructor(type, rank = null, cards_len = null, is_wangzha = false) {
        this.type = type
        this.rank = rank
        this.cards_len = cards_len
        if (is_wangzha) {
            // 由于普通炸弹最长长度为8，所以四个王炸长度设为10,2个王炸长度设为9
            // 从而比较炸弹的大小时，用 cards_len，rank排序就好
            this.cards_len = this.cards_len === 4 ? 10 : 9
        }
    }

    is_bigger(other_cards_info) {
        if (!other_cards_info) {
            return { res: true }
        }
        if (this.type === other_cards_info.type) {
            if (this.type !== CardsType.ZHADAN) {
                if (this.cards_len === other_cards_info.cards_len) {
                    if (this.rank > other_cards_info.rank) {
                        return { res: true }
                    }
                    else {
                        return {
                            res: false,
                            msg: "不比上家牌大"
                        }
                    }
                }
                else {
                    return {
                        res: false,
                        msg: "牌长度不一致"
                    }
                }
            }
            else {
                if (this.cards_len < other_cards_info.cards_len) {
                    return {
                        res: false,
                        msg: "不比上家牌大"
                    }
                }
                else {
                    if ((this.cards_len > other_cards_info.cards_len) || (this.rank > other_cards_info.rank)) {
                        return { res: true }
                    }
                    else {
                        return {
                            res: false,
                            msg: "不比上家牌大"
                        }
                    }
                }
            }
        }
        else if (other_cards_info.type != CardsType.ZHADAN && this.type == CardsType.ZHADAN) {
            return { res: true }
        }
        else {
            return {
                res: false,
                msg: "不符合规则或不比上家牌大"
            }
        }
    }
}


function get_card_name(card) {
    return card.split("_")[0]
}

function get_card_rank(card) {
    return CARDS_RANK[get_card_name(card)]
}

function get_card_color(card) {
    if (card.includes("_")) {
        return COLORS[card.split("_")[1]][0]
    }
    return null
}

function create_poker(num_pokers) {
    // num_pokers: 牌的副数
    let all_cards = []
    NORMAL_CARDS.forEach(element => {
        for (let color in COLORS) {
            all_cards.push(element + "_" + color)
        }
    })
    SPECIAL_CARDS.forEach(element => {
        all_cards.push(element)
    })
    all_cards = [].concat(...Array(num_pokers).fill(all_cards))
    return all_cards
}

function get_cards_info(cards) {
    const first_card_rank = get_card_rank(cards[0])
    const first_card_name = get_card_name(cards[0])
    const cards_len = cards.length

    if (cards_len === 1) {
        return new CardsInfo(CardsType.DAN, first_card_rank, cards_len)
    }

    if (cards_len === 2 && first_card_name === get_card_name(cards[1])) {
        if (SPECIAL_CARDS.has(first_card_name)) {
            return new CardsInfo(CardsType.ZHADAN, first_card_rank, cards_len, true)
        }
        else {
            return new CardsInfo(CardsType.DUIZI, first_card_rank, cards_len)
        }
    }

    if (cards_len === 3 && first_card_name === get_card_name(cards[1]) && first_card_name === get_card_name(cards[2])) {
        return new CardsInfo(CardsType.FEIJI, first_card_rank, cards_len)
    }

    if (cards_len == 3 && cards.every(card => SPECIAL_CARDS.has(get_card_name(card)))) {
        return new CardsInfo(CardsType.FEIJI, CARDS_RANK["XW"], cards_len);
    }

    if (cards_len >= 4 && cards.every(card => get_card_name(card) == first_card_name)) {
        return new CardsInfo(CardsType.ZHADAN, first_card_rank, cards_len);
    }

    if (cards_len == 4 && cards.every(card => SPECIAL_CARDS.has(get_card_name(card)))) {
        return new CardsInfo(CardsType.ZHADAN, first_card_rank, cards_len, true);
    }

    if (cards_len >= 5) {
        if (cards.some(card => get_card_name(card) == '2')) {
            return new CardsInfo(CardsType.NOT_VALID);
        }

        let step;
        if (first_card_name != get_card_name(cards[1])) {
            step = 1;
        }
        else {
            step = 2;
        }

        let is_shunzi = true;
        for (let i = step; i < cards_len; i++) {
            if (get_card_rank(cards[i]) - get_card_rank(cards[i - step]) != 1) {
                is_shunzi = false;
            }
        }
        if (is_shunzi) {
            if (step == 1) {
                return new CardsInfo(CardsType.SHUNZI, first_card_rank, cards_len);
            } else {
                return new CardsInfo(CardsType.LIANDU, first_card_rank, cards_len);
            }
        } else {
            return new CardsInfo(CardsType.NOT_VALID);
        }
    }
    return new CardsInfo(CardsType.NOT_VALID)
}

function rank_raw_cards(raw_out_cards, desc = false) {

    function get_card_info(card) {
        let name = null, color = null, rank = null, joker = null
        if(card.includes("_")) {
            [name, color] = card.split("_")
            rank = CARDS_RANK[name]
            color = COLORS[color]
        }
        else if (card.includes("-")){
            [joker, name] = card.split("-")
            rank = CARDS_RANK[name]
            color = joker === "XW" ? "z1" : "z2"
        }
        else {
            rank = CARDS_RANK[card]
            color = card === "XW" ? "z1" : "z2"
        }
        return [rank, color]
    }

    raw_out_cards.sort((a, b) => {
        const [aRank, aColor] = get_card_info(a)
        const [bRank, bColor] = get_card_info(b)

        if (aRank < bRank) {
            return -1
        }
        if (aRank > bRank) {
            return 1
        }
        if (aColor < bColor) {
            return -1
        }
        if (aColor > bColor) {
            return 1
        }
        return 0
    })
    if (desc) {
        raw_out_cards.reverse()
    }
    return raw_out_cards
}

function is_valid_out_cards(raw_out_cards, is_pass, last_valid_cards_info, is_start) {
    if (is_pass) {
        if (is_start) {
            return { status: -1, msg: "你是该回合首位出牌玩家，无法跳过" }
        }
        else {
            return { status: 2, msg: "跳过" }
        }
    }

    let out_cards = rank_raw_cards(raw_out_cards)

    let raw_cards = []
    let final_cards = []
    for (let card of out_cards) {
        let raw_card = card.split('-')[0]
        raw_cards.push(raw_card)

        if (!card.includes("-")) {
            final_cards.push(raw_card)
        }
        else {
            let final_card = card.split('-')[1]
            final_cards.push(final_card)
        }
    }

    let cards_info = get_cards_info(final_cards)
    let cards_value = get_cards_value(raw_cards)
    if (cards_info.type === CardsType.NOT_VALID) {
        return { status: 0, msg: '不符合规则' }
    }
    else {
        let res = cards_info.is_bigger(last_valid_cards_info)
        if (!res.res) {
            return { status: 0, msg: res.msg }
        }
        else {
            return {
                status: 1,
                msg: '出牌有效',
                raw_cards: raw_cards,
                cards_value: cards_value,
                cards_info: cards_info,
            }
        }
    }
}


function get_cards_value(raw_cards) {
    // 判断出牌（炸弹）的赏钱
    let value = 0;

    // 四个王
    if (raw_cards.length === 4 && raw_cards.every(card => SPECIAL_CARDS.has(card))) {
        value = 4;
        return value;
    }

    // 在四个王判断后，去掉牌中的王再判断，比如 出牌为 8 8 8 8 8 王
    raw_cards = raw_cards.filter(card => !SPECIAL_CARDS.has(card))

    // 其他炸弹
    if (raw_cards.length >= 4 && raw_cards.every(card => get_card_name(raw_cards[0]) === get_card_name(card))) {
        if (raw_cards.length === 8) {
            value = 5;
            return value;
        } else if (raw_cards.length === 7) {
            value += 2;
        } else if (raw_cards.length === 6) {
            value += 1;
        }

        // 含有清一色有四个相同的花色
        let blackCnts = 0;
        let redCnts = 0;
        for (const card of raw_cards) {
            if (get_card_color(card) === 'r') {
                redCnts += 1;
            } else {
                blackCnts += 1;
            }

            if (blackCnts === 4 || redCnts === 4) {
                value += 1;
                break;
            }
        }

        return value;
    }

    return value;
}


export {
    is_valid_out_cards,
    rank_raw_cards,
    OutState,
    SPECIAL_CARDS
}