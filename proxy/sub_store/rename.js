/**
 * Sub-Store 节点重命名脚本
 *
 * 使用方式：把脚本添加为 Sub-Store 的「脚本操作」，参数写在脚本 URL 的 `#` 后面
 * 多个参数使用 `&` 连接，例如：`<脚本URL>#out=en&flag=false&order=true`
 *
 * 一、国家/地区识别与输出
 *
 * - `in`：指定原节点名采用的国家标识类型；不填写时自动识别
 *   自动识别优先级：中文名称 -> 国旗 -> 英文全称 -> 英文国家码
 *   同类名称按最长内容优先匹配，例如「印度尼西亚」不会误判为「印度」
 *   - `cn` / `zh`：中文名称，例如「香港」「印度尼西亚」
 *   - `gq` / `flag`：国旗，例如「🇭🇰」「🇮🇩」
 *   - `quan`：英文全称，例如「Hong Kong」「Indonesia」
 *   - `us` / `en`：英文国家码，例如「HK」「ID」
 *
 * - `out`：输出国家标识类型，默认 `cn`
 *   可选值与 `in` 相同：`cn` / `zh`、`gq` / `flag`、`quan`、`us` / `en`
 *
 * - `flag`：是否在输出名称前添加国旗，默认 `true`
 * - `nm`：是否保留无法识别国家的节点，默认 `true`
 *   保留时统一命名为「🇺🇳 未知 01」；设为 `false` 时删除这些节点
 *
 * 二、名称、分隔符与序号
 *
 * - `name`：给节点添加自定义名称/机场名称前缀，默认不添加
 * - `nf`：自定义名称的位置，默认 `false`
 *   - `false`：国旗在前，例如「🇭🇰 机场名 香港 01」
 *   - `true`：自定义名称在最前，例如「机场名 🇭🇰 香港 01」
 * - `fgf`：名称各部分之间的分隔符，默认一个空格
 * - `sn`：国家名称与序号之间的分隔符，默认一个空格
 * - `one`：某地区只有一个节点时，是否移除末尾的 `01`，默认 `false`
 *
 * 三、排序
 *
 * - `order`：是否保留订阅中的原始节点顺序，默认 `false`
 *   - `false`：按重命名后的国家/标识分组排序并编号
 *   - `true`：保留原始顺序，只在各分组内依次编号
 * - `blpx`：把带倍率或专线标识的节点排到普通节点之后，默认 `false`；通常配合 `bl` 使用
 *
 * 四、倍率、线路标识与名称清理
 *
 * - `bl`：在新名称中保留倍率，例如 `2x`、`3倍`、`×5` 会统一显示为 `2×`、`3×`、`5×`
 * - `blgd`：保留常见线路标识，例如 IPLC、IEPL、家宽、游戏、GPT、UDP，默认 `false`
 * - `nx`：只保留无倍率或倍率等于 1 的节点，默认 `false`
 * - `blnx`：只保留「高倍」或倍率大于 1 的节点，默认 `false`
 * - `clear`：过滤名称中含「套餐、到期、剩余、流量、官网、订阅」等信息节点，默认 `true`
 * - `blkey`：保留自定义关键词，多个关键词用 `+` 分隔；使用 `原词>新词` 可替换显示内容
 *   示例：`blkey=IPLC+GPT>AI+家宽`
 * - `key`：旧版特殊节点筛选规则，仅为兼容保留；不了解规则时请勿开启
 *
 * 五、节点属性
 *
 * - `address`：把所有节点的服务器地址替换为指定地址，默认不修改
 * - `blockquic`：设置节点的 `block-quic` 属性
 *   - `on`：设置为 `on`
 *   - `off`：设置为 `off`
 *   - 不填写：移除该属性
 *
 * 六、布尔参数写法
 *
 * 布尔参数支持 `true/false`、`1/0`、`on/off`、`yes/no`，不区分大小写
 *
 * 七、常用示例
 *
 * 1. 默认：自动识别国家，输出「国旗 + 中文名称 + 序号」并分组排序
 *    `<脚本URL>`
 *
 * 2. 保留原始顺序，关闭国旗，输出英文国家码
 *    `<脚本URL>#order=true&flag=false&out=en`
 *
 * 3. 已知原节点使用国旗，输出英文全称
 *    `<脚本URL>#in=flag&out=quan`
 *
 * 4. 添加机场名前缀，并删除无法识别国家的节点
 *    `<脚本URL>#name=机场名&nf=true&nm=false`
 *
 * 5. 保留倍率、线路标识和自定义关键词
 *    `<脚本URL>#bl=true&blgd=true&blkey=IPLC+GPT>AI+家宽`
 *
 * 6. 仅保留无倍率/1 倍节点，同时关闭默认的信息节点清理
 *    `<脚本URL>#nx=true&clear=false`
 */

const inArg = $arguments;

// Sub-Store 的 URL 参数在不同版本/调用方式下可能是布尔值，也可能是字符串
// 直接使用 `value || false` 会把字符串 "false" 当成 true
function booleanArg(value, defaultValue = false) {
    if (value === undefined || value === null || value === "") return defaultValue;
    if (typeof value === "boolean") return value;
    if (typeof value === "number") return value !== 0;
    const normalized = String(value).trim().toLowerCase();
    if (["false", "0", "off", "no"].includes(normalized)) return false;
    if (["true", "1", "on", "yes"].includes(normalized)) return true;
    return defaultValue;
}

const nx = booleanArg(inArg.nx),
    bl = booleanArg(inArg.bl),
    nf = booleanArg(inArg.nf),
    key = booleanArg(inArg.key),
    blgd = booleanArg(inArg.blgd),
    blpx = booleanArg(inArg.blpx),
    blnx = booleanArg(inArg.blnx),
    numone = booleanArg(inArg.one),
    debug = booleanArg(inArg.debug),
    keepOrder = booleanArg(inArg.order),
    clear = booleanArg(inArg.clear, true),
    addflag = booleanArg(inArg.flag, true),
    nm = booleanArg(inArg.nm, true);

const FGF = inArg.fgf == undefined ? " " : decodeURI(inArg.fgf),
    XHFGF = inArg.sn == undefined ? " " : decodeURI(inArg.sn),
    FNAME = inArg.name == undefined ? "" : decodeURI(inArg.name),
    BLKEY = inArg.blkey == undefined ? "" : decodeURI(inArg.blkey),
    blockquic = inArg.blockquic == undefined ? "" : decodeURI(inArg.blockquic),
    NEW_ADDRESS = inArg.address == undefined ? "" : decodeURI(inArg.address),
    nameMap = {
        cn: "cn",
        zh: "cn",
        us: "us",
        en: "us",
        quan: "quan",
        gq: "gq",
        flag: "gq",
    },
    inname = nameMap[inArg.in] || "",
    outputName = nameMap[inArg.out] || "cn";

// prettier-ignore
const FG = ['🇨🇳', '🇭🇰', '🇲🇴', '🇹🇼', '🇯🇵', '🇰🇷', '🇸🇬', '🇺🇸', '🇬🇧', '🇫🇷', '🇩🇪', '🇦🇺', '🇦🇪', '🇦🇫', '🇦🇱', '🇩🇿', '🇦🇴', '🇦🇷', '🇦🇲', '🇦🇹', '🇦🇿', '🇧🇭', '🇧🇩', '🇧🇾', '🇧🇪', '🇧🇿', '🇧🇯', '🇧🇹', '🇧🇴', '🇧🇦', '🇧🇼', '🇧🇷', '🇻🇬', '🇧🇳', '🇧🇬', '🇧🇫', '🇧🇮', '🇰🇭', '🇨🇲', '🇨🇦', '🇨🇻', '🇰🇾', '🇨🇫', '🇹🇩', '🇨🇱', '🇨🇴', '🇰🇲', '🇨🇬', '🇨🇩', '🇨🇷', '🇭🇷', '🇨🇾', '🇨🇿', '🇩🇰', '🇩🇯', '🇩🇴', '🇪🇨', '🇪🇬', '🇸🇻', '🇬🇶', '🇪🇷', '🇪🇪', '🇪🇹', '🇫🇯', '🇫🇮', '🇬🇦', '🇬🇲', '🇬🇪', '🇬🇭', '🇬🇷', '🇬🇱', '🇬🇹', '🇬🇳', '🇬🇾', '🇭🇹', '🇭🇳', '🇭🇺', '🇮🇸', '🇮🇳', '🇮🇩', '🇮🇷', '🇮🇶', '🇮🇪', '🇮🇲', '🇮🇱', '🇮🇹', '🇨🇮', '🇯🇲', '🇯🇴', '🇰🇿', '🇰🇪', '🇰🇼', '🇰🇬', '🇱🇦', '🇱🇻', '🇱🇧', '🇱🇸', '🇱🇷', '🇱🇾', '🇱🇹', '🇱🇺', '🇲🇰', '🇲🇬', '🇲🇼', '🇲🇾', '🇲🇻', '🇲🇱', '🇲🇹', '🇲🇷', '🇲🇺', '🇲🇽', '🇲🇩', '🇲🇨', '🇲🇳', '🇲🇪', '🇲🇦', '🇲🇿', '🇲🇲', '🇳🇦', '🇳🇵', '🇳🇱', '🇳🇿', '🇳🇮', '🇳🇪', '🇳🇬', '🇰🇵', '🇳🇴', '🇴🇲', '🇵🇰', '🇵🇦', '🇵🇾', '🇵🇪', '🇵🇭', '🇵🇹', '🇵🇷', '🇶🇦', '🇷🇴', '🇷🇺', '🇷🇼', '🇸🇲', '🇸🇦', '🇸🇳', '🇷🇸', '🇸🇱', '🇸🇰', '🇸🇮', '🇸🇴', '🇿🇦', '🇪🇸', '🇱🇰', '🇸🇩', '🇸🇷', '🇸🇿', '🇸🇪', '🇨🇭', '🇸🇾', '🇹🇯', '🇹🇿', '🇹🇭', '🇹🇬', '🇹🇴', '🇹🇹', '🇹🇳', '🇹🇷', '🇹🇲', '🇻🇮', '🇺🇬', '🇺🇦', '🇺🇾', '🇺🇿', '🇻🇪', '🇻🇳', '🇾🇪', '🇿🇲', '🇿🇼', '🇦🇩', '🇷🇪', '🇵🇱', '🇬🇺', '🇻🇦', '🇱🇮', '🇨🇼', '🇸🇨', '🇦🇶', '🇬🇮', '🇨🇺', '🇫🇴', '🇦🇽', '🇧🇲', '🇹🇱'];
// prettier-ignore
const EN = ['CN', 'HK', 'MO', 'TW', 'JP', 'KR', 'SG', 'US', 'GB', 'FR', 'DE', 'AU', 'AE', 'AF', 'AL', 'DZ', 'AO', 'AR', 'AM', 'AT', 'AZ', 'BH', 'BD', 'BY', 'BE', 'BZ', 'BJ', 'BT', 'BO', 'BA', 'BW', 'BR', 'VG', 'BN', 'BG', 'BF', 'BI', 'KH', 'CM', 'CA', 'CV', 'KY', 'CF', 'TD', 'CL', 'CO', 'KM', 'CG', 'CD', 'CR', 'HR', 'CY', 'CZ', 'DK', 'DJ', 'DO', 'EC', 'EG', 'SV', 'GQ', 'ER', 'EE', 'ET', 'FJ', 'FI', 'GA', 'GM', 'GE', 'GH', 'GR', 'GL', 'GT', 'GN', 'GY', 'HT', 'HN', 'HU', 'IS', 'IN', 'ID', 'IR', 'IQ', 'IE', 'IM', 'IL', 'IT', 'CI', 'JM', 'JO', 'KZ', 'KE', 'KW', 'KG', 'LA', 'LV', 'LB', 'LS', 'LR', 'LY', 'LT', 'LU', 'MK', 'MG', 'MW', 'MY', 'MV', 'ML', 'MT', 'MR', 'MU', 'MX', 'MD', 'MC', 'MN', 'ME', 'MA', 'MZ', 'MM', 'NA', 'NP', 'NL', 'NZ', 'NI', 'NE', 'NG', 'KP', 'NO', 'OM', 'PK', 'PA', 'PY', 'PE', 'PH', 'PT', 'PR', 'QA', 'RO', 'RU', 'RW', 'SM', 'SA', 'SN', 'RS', 'SL', 'SK', 'SI', 'SO', 'ZA', 'ES', 'LK', 'SD', 'SR', 'SZ', 'SE', 'CH', 'SY', 'TJ', 'TZ', 'TH', 'TG', 'TO', 'TT', 'TN', 'TR', 'TM', 'VI', 'UG', 'UA', 'UY', 'UZ', 'VE', 'VN', 'YE', 'ZM', 'ZW', 'AD', 'RE', 'PL', 'GU', 'VA', 'LI', 'CW', 'SC', 'AQ', 'GI', 'CU', 'FO', 'AX', 'BM', 'TL'];
// prettier-ignore
const ZH = ['中国', '香港', '澳门', '台湾', '日本', '韩国', '新加坡', '美国', '英国', '法国', '德国', '澳大利亚', '阿联酋', '阿富汗', '阿尔巴尼亚', '阿尔及利亚', '安哥拉', '阿根廷', '亚美尼亚', '奥地利', '阿塞拜疆', '巴林', '孟加拉国', '白俄罗斯', '比利时', '伯利兹', '贝宁', '不丹', '玻利维亚', '波斯尼亚和黑塞哥维那', '博茨瓦纳', '巴西', '英属维京群岛', '文莱', '保加利亚', '布基纳法索', '布隆迪', '柬埔寨', '喀麦隆', '加拿大', '佛得角', '开曼群岛', '中非共和国', '乍得', '智利', '哥伦比亚', '科摩罗', '刚果(布)', '刚果(金)', '哥斯达黎加', '克罗地亚', '塞浦路斯', '捷克', '丹麦', '吉布提', '多米尼加共和国', '厄瓜多尔', '埃及', '萨尔瓦多', '赤道几内亚', '厄立特里亚', '爱沙尼亚', '埃塞俄比亚', '斐济', '芬兰', '加蓬', '冈比亚', '格鲁吉亚', '加纳', '希腊', '格陵兰', '危地马拉', '几内亚', '圭亚那', '海地', '洪都拉斯', '匈牙利', '冰岛', '印度', '印尼', '伊朗', '伊拉克', '爱尔兰', '马恩岛', '以色列', '意大利', '科特迪瓦', '牙买加', '约旦', '哈萨克斯坦', '肯尼亚', '科威特', '吉尔吉斯斯坦', '老挝', '拉脱维亚', '黎巴嫩', '莱索托', '利比里亚', '利比亚', '立陶宛', '卢森堡', '马其顿', '马达加斯加', '马拉维', '马来', '马尔代夫', '马里', '马耳他', '毛利塔尼亚', '毛里求斯', '墨西哥', '摩尔多瓦', '摩纳哥', '蒙古', '黑山共和国', '摩洛哥', '莫桑比克', '缅甸', '纳米比亚', '尼泊尔', '荷兰', '新西兰', '尼加拉瓜', '尼日尔', '尼日利亚', '朝鲜', '挪威', '阿曼', '巴基斯坦', '巴拿马', '巴拉圭', '秘鲁', '菲律宾', '葡萄牙', '波多黎各', '卡塔尔', '罗马尼亚', '俄罗斯', '卢旺达', '圣马力诺', '沙特阿拉伯', '塞内加尔', '塞尔维亚', '塞拉利昂', '斯洛伐克', '斯洛文尼亚', '索马里', '南非', '西班牙', '斯里兰卡', '苏丹', '苏里南', '斯威士兰', '瑞典', '瑞士', '叙利亚', '塔吉克斯坦', '坦桑尼亚', '泰国', '多哥', '汤加', '特立尼达和多巴哥', '突尼斯', '土耳其', '土库曼斯坦', '美属维尔京群岛', '乌干达', '乌克兰', '乌拉圭', '乌兹别克斯坦', '委内瑞拉', '越南', '也门', '赞比亚', '津巴布韦', '安道尔', '留尼汪', '波兰', '关岛', '梵蒂冈', '列支敦士登', '库拉索', '塞舌尔', '南极', '直布罗陀', '古巴', '法罗群岛', '奥兰群岛', '百慕达', '东帝汶'];
// prettier-ignore
const QC = ['China', 'Hong Kong', 'Macao', 'Taiwan', 'Japan', 'Korea', 'Singapore', 'United States', 'United Kingdom', 'France', 'Germany', 'Australia', 'Dubai', 'Afghanistan', 'Albania', 'Algeria', 'Angola', 'Argentina', 'Armenia', 'Austria', 'Azerbaijan', 'Bahrain', 'Bangladesh', 'Belarus', 'Belgium', 'Belize', 'Benin', 'Bhutan', 'Bolivia', 'Bosnia and Herzegovina', 'Botswana', 'Brazil', 'British Virgin Islands', 'Brunei', 'Bulgaria', 'Burkina-faso', 'Burundi', 'Cambodia', 'Cameroon', 'Canada', 'CapeVerde', 'CaymanIslands', 'Central African Republic', 'Chad', 'Chile', 'Colombia', 'Comoros', 'Congo-Brazzaville', 'Congo-Kinshasa', 'CostaRica', 'Croatia', 'Cyprus', 'Czech Republic', 'Denmark', 'Djibouti', 'Dominican Republic', 'Ecuador', 'Egypt', 'EISalvador', 'Equatorial Guinea', 'Eritrea', 'Estonia', 'Ethiopia', 'Fiji', 'Finland', 'Gabon', 'Gambia', 'Georgia', 'Ghana', 'Greece', 'Greenland', 'Guatemala', 'Guinea', 'Guyana', 'Haiti', 'Honduras', 'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Isle of Man', 'Israel', 'Italy', 'Ivory Coast', 'Jamaica', 'Jordan', 'Kazakstan', 'Kenya', 'Kuwait', 'Kyrgyzstan', 'Laos', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Lithuania', 'Luxembourg', 'Macedonia', 'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta', 'Mauritania', 'Mauritius', 'Mexico', 'Moldova', 'Monaco', 'Mongolia', 'Montenegro', 'Morocco', 'Mozambique', 'Myanmar(Burma)', 'Namibia', 'Nepal', 'Netherlands', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'NorthKorea', 'Norway', 'Oman', 'Pakistan', 'Panama', 'Paraguay', 'Peru', 'Philippines', 'Portugal', 'PuertoRico', 'Qatar', 'Romania', 'Russia', 'Rwanda', 'SanMarino', 'SaudiArabia', 'Senegal', 'Serbia', 'SierraLeone', 'Slovakia', 'Slovenia', 'Somalia', 'SouthAfrica', 'Spain', 'SriLanka', 'Sudan', 'Suriname', 'Swaziland', 'Sweden', 'Switzerland', 'Syria', 'Tajikstan', 'Tanzania', 'Thailand', 'Togo', 'Tonga', 'TrinidadandTobago', 'Tunisia', 'Turkey', 'Turkmenistan', 'U.S.Virgin Islands', 'Uganda', 'Ukraine', 'Uruguay', 'Uzbekistan', 'Venezuela', 'Vietnam', 'Yemen', 'Zambia', 'Zimbabwe', 'Andorra', 'Reunion', 'Poland', 'Guam', 'Vatican', 'Liechtensteins', 'Curacao', 'Seychelles', 'Antarctica', 'Gibraltar', 'Cuba', 'Faroe Islands', 'Ahvenanmaa', 'Bermuda', 'Timor-Leste'];

// 常见正式名称、旧拼写和缩写。别名只负责定位国家，输出仍由 cn/us/gq/quan 决定
const COUNTRY_ALIASES = {
    cn: {
        CN: ["中国大陆", "大陆"],
        ID: ["印度尼西亚"],
        MY: ["马来西亚"],
        KR: ["南韩"],
        KP: ["北韩"],
        AE: ["阿拉伯联合酋长国"],
        BA: ["波黑", "波黑共和国"],
        CZ: ["捷克共和国"],
        MK: ["北马其顿"],
        SZ: ["斯威士兰", "斯威士兰王国"],
    },
    quan: {
        GB: ["Great Britain"],
        AE: ["United Arab Emirates"],
        KR: ["South Korea", "Republic of Korea"],
        KP: ["North Korea", "DPRK"],
        CV: ["Cape Verde"],
        KY: ["Cayman Islands"],
        CR: ["Costa Rica"],
        SV: ["El Salvador"],
        KZ: ["Kazakhstan"],
        MK: ["North Macedonia"],
        MM: ["Myanmar", "Burma"],
        PR: ["Puerto Rico"],
        SM: ["San Marino"],
        SA: ["Saudi Arabia"],
        SL: ["Sierra Leone"],
        ZA: ["South Africa"],
        LK: ["Sri Lanka"],
        TJ: ["Tajikistan"],
        TT: ["Trinidad and Tobago"],
        VI: ["U.S. Virgin Islands", "US Virgin Islands"],
        LI: ["Liechtenstein"],
        AX: ["Aland Islands", "Åland Islands"],
        CI: ["Cote d'Ivoire", "Côte d’Ivoire"],
        CZ: ["Czechia"],
        SZ: ["Eswatini"],
        RU: ["Russian Federation"],
        VN: ["Viet Nam"],
        LA: ["Lao PDR"],
    },
    us: {
        GB: ["UK"],
        AE: ["UAE"],
    },
};

function getCountryIndex(code) {
    return EN.indexOf(code);
}

function buildCountryMatchers(type) {
    const list = getList(type);
    const matchers = list.map((text, countryIndex) => ({ text, countryIndex }));
    const aliases = COUNTRY_ALIASES[type] || {};
    Object.keys(aliases).forEach((code) => {
        const countryIndex = getCountryIndex(code);
        if (countryIndex === -1) return;
        aliases[code].forEach((text) => matchers.push({ text, countryIndex }));
    });
    return matchers.sort((a, b) => b.text.length - a.text.length);
}

function isLatinLetter(character) {
    return character !== undefined && /[A-Za-z]/.test(character);
}

function containsCountryText(source, target, type, forceCodeInput) {
    if (type === "cn" || type === "gq") return source.includes(target);

    // 自动识别国家码时只接受大写，避免把 in/us/do 等普通英文片段当成国家
    const caseSensitive = type === "us" && !forceCodeInput;
    const haystack = caseSensitive ? source : source.toLowerCase();
    const needle = caseSensitive ? target : target.toLowerCase();
    let fromIndex = 0;

    while (fromIndex <= haystack.length - needle.length) {
        const index = haystack.indexOf(needle, fromIndex);
        if (index === -1) return false;
        const before = index > 0 ? source[index - 1] : undefined;
        const afterIndex = index + target.length;
        const after = afterIndex < source.length ? source[afterIndex] : undefined;
        if (!isLatinLetter(before) && !isLatinLetter(after)) return true;
        fromIndex = index + 1;
    }
    return false;
}

const COUNTRY_MATCHERS = {
    cn: buildCountryMatchers("cn"),
    gq: buildCountryMatchers("gq"),
    quan: buildCountryMatchers("quan"),
    us: buildCountryMatchers("us"),
};

function findCountryIndex(name) {
    const types = inname ? [inname] : ["cn", "gq", "quan", "us"];
    for (const type of types) {
        const match = COUNTRY_MATCHERS[type].find(({ text }) =>
            containsCountryText(name, text, type, inname === "us")
        );
        if (match) return match.countryIndex;
    }
    return -1;
}

const specialRegex = [
    /(\d\.)?\d+×/,
    /IPLC|IEPL|Kern|Edge|Pro|Std|Exp|Biz|Fam|Game|Buy|Zx|LB|Game/,
];
const nameclear =
    /(套餐|到期|有效|剩余|版本|已用|过期|失联|测试|官方|网址|备用|群|TEST|客服|网站|获取|订阅|流量|机场|下次|官址|联系|邮箱|工单|学术|USE|USED|TOTAL|EXPIRE|EMAIL)/i;
// prettier-ignore
const regexArray = [/ˣ²/, /ˣ³/, /ˣ⁴/, /ˣ⁵/, /ˣ⁶/, /ˣ⁷/, /ˣ⁸/, /ˣ⁹/, /ˣ¹⁰/, /ˣ²⁰/, /ˣ³⁰/, /ˣ⁴⁰/, /ˣ⁵⁰/, /IPLC/i, /IEPL/i, /核心/, /边缘/, /高级/, /标准/, /实验/, /商宽/, /家宽/, /游戏|game/i, /购物/, /专线/, /LB/, /cloudflare/i, /\budp\b/i, /\bgpt\b/i, /udpn\b/];
// prettier-ignore
const valueArray = ["2×", "3×", "4×", "5×", "6×", "7×", "8×", "9×", "10×", "20×", "30×", "40×", "50×", "IPLC", "IEPL", "Kern", "Edge", "Pro", "Std", "Exp", "Biz", "Fam", "Game", "Buy", "Zx", "LB", "CF", "UDP", "GPT", "UDPN"];
const SUPERSCRIPT_MULTIPLIERS = {
    "ˣ²": 2, "ˣ³": 3, "ˣ⁴": 4, "ˣ⁵": 5, "ˣ⁶": 6, "ˣ⁷": 7,
    "ˣ⁸": 8, "ˣ⁹": 9, "ˣ¹⁰": 10, "ˣ²⁰": 20, "ˣ³⁰": 30,
    "ˣ⁴⁰": 40, "ˣ⁵⁰": 50,
};

function getMultiplier(name) {
    for (const marker of Object.keys(SUPERSCRIPT_MULTIPLIERS)) {
        if (name.includes(marker)) return SUPERSCRIPT_MULTIPLIERS[marker];
    }
    const suffixMatch = name.match(/((?:\d{1,3}\.)?\d+)\s*(?:倍|[x×])/i);
    const prefixMatch = name.match(/(?:倍率|[x×])\s*((?:\d{1,3}\.)?\d+)/i);
    const value = suffixMatch?.[1] || prefixMatch?.[1];
    return value === undefined ? null : Number(value);
}

function hasHighMultiplier(name) {
    const multiplier = getMultiplier(name);
    return /高倍/i.test(name) || (multiplier !== null && multiplier > 1);
}
const keya =
    /港|Hong|HK|新加坡|SG|Singapore|日本|Japan|JP|美国|United States|US|韩|土耳其|TR|Turkey|Korea|KR|🇸🇬|🇭🇰|🇯🇵|🇺🇸|🇰🇷|🇹🇷/i;
const keyb =
    /(((1|2|3|4)\d)|(香港|Hong|HK) 0[5-9]|((新加坡|SG|Singapore|日本|Japan|JP|美国|United States|US|韩|土耳其|TR|Turkey|Korea|KR) 0[3-9]))/i;
const rurekey = {
    "B-G-P": /BGP/g,
    "Russia Moscow": /Moscow/gi,
    "Korea Chuncheon": /Chuncheon|Seoul/gi,
    "Hong Kong": /Hongkong|HONG KONG/gi,
    "United Kingdom London": /London|Great Britain/gi,
    "Dubai United Arab Emirates": /United Arab Emirates/gi,
    "Taiwan TW 台湾 🇹🇼": /(台|Tai\s?wan|TW).*?🇨🇳|🇨🇳.*?(台|Tai\s?wan|TW)/g,
    "United States": /\bUSA\b|Los Angeles|San Jose|Silicon Valley|Michigan/gi,
    澳大利亚: /澳洲|墨尔本|悉尼|土澳|(深|沪|呼|京|广|杭)澳/g,
    德国: /(深|沪|呼|京|广|杭)德(?!.*(I|线))|法兰克福|滬德/g,
    香港: /(深|沪|呼|京|广|杭)港(?!.*(I|线))/g,
    日本: /(深|沪|呼|京|广|杭|中|辽)日(?!.*(I|线))|东京|大坂/g,
    新加坡: /狮城|(深|沪|呼|京|广|杭)新/g,
    美国: /(深|沪|呼|京|广|杭)美|波特兰|芝加哥|哥伦布|纽约|硅谷|俄勒冈|西雅图|芝加哥/g,
    波斯尼亚和黑塞哥维那: /波黑共和国/g,
    印尼: /印度尼西亚|雅加达/g,
    印度: /孟买/g,
    阿联酋: /迪拜|阿拉伯联合酋长国/g,
    孟加拉国: /孟加拉/g,
    捷克: /捷克共和国/g,
    台湾: /新台|新北|台(?!.*线)/g,
    Taiwan: /Taipei/gi,
    韩国: /春川|韩|首尔/g,
    Japan: /Tokyo|Osaka|Fukuoka/gi,
    英国: /伦敦/g,
    India: /Mumbai|New Delhi|Delhi/gi,
    Germany: /Frankfurt/gi,
    Switzerland: /Zurich/gi,
    俄罗斯: /莫斯科/g,
    土耳其: /伊斯坦布尔/g,
    泰国: /泰國|曼谷/g,
    法国: /巴黎/g,
    G: /\d\s?GB/gi,
    Esnc: /esnc/gi
};

function operator(pro) {
    const outList = getList(outputName);

    if (clear || nx || blnx || key) {
        pro = pro.filter((res) => {
            const resname = res.name;
            const multiplier = getMultiplier(resname);
            const shouldKeep =
                !(clear && nameclear.test(resname)) &&
                !(nx && multiplier !== null && multiplier !== 1) &&
                !(blnx && !hasHighMultiplier(resname)) &&
                !(key && !(keya.test(resname) && /2|4|6|7/i.test(resname)));
            return shouldKeep;
        });
    }

    const BLKEYS = BLKEY ? BLKEY.split("+") : "";

    pro.forEach((e) => {
        let retainKey = "";
        if (NEW_ADDRESS !== "") {
            e.server = NEW_ADDRESS;
            if (e.address !== undefined) e.address = NEW_ADDRESS;
        }
        let bktf = false, ens = e.name;
        Object.keys(rurekey).forEach((ikey) => {
            const matcher = rurekey[ikey];
            matcher.lastIndex = 0;
            if (matcher.test(e.name)) {
                matcher.lastIndex = 0;
                e.name = e.name.replace(matcher, ikey);
                if (BLKEY) {
                    bktf = true;
                    let BLKEY_REPLACE = "",
                        re = false;
                    BLKEYS.forEach((i) => {
                        if (i.includes(">") && ens.includes(i.split(">")[0])) {
                            matcher.lastIndex = 0;
                            if (matcher.test(i.split(">")[0])) {
                                e.name += " " + i.split(">")[0];
                            }
                            if (i.split(">")[1]) {
                                BLKEY_REPLACE = i.split(">")[1];
                                re = true;
                            }
                        } else {
                            if (ens.includes(i)) {
                                e.name += " " + i;
                            }
                        }
                        retainKey = re
                            ? BLKEY_REPLACE
                            : BLKEYS.filter((items) => e.name.includes(items));
                    });
                }
            }
        });
        if (blockquic == "on") {
            e["block-quic"] = "on";
        } else if (blockquic == "off") {
            e["block-quic"] = "off";
        } else {
            delete e["block-quic"];
        }

        if (!bktf && BLKEY) {
            let BLKEY_REPLACE = "",
                re = false;
            BLKEYS.forEach((i) => {
                if (i.includes(">") && e.name.includes(i.split(">")[0])) {
                    if (i.split(">")[1]) {
                        BLKEY_REPLACE = i.split(">")[1];
                        re = true;
                    }
                }
            });
            retainKey = re
                ? BLKEY_REPLACE
                : BLKEYS.filter((items) => e.name.includes(items));
        }

        let ikey = "",
            ikeys = "";
        if (blgd) {
            regexArray.forEach((regex, index) => {
                if (regex.test(e.name)) {
                    ikeys = valueArray[index];
                }
            });
        }

        if (bl) {
            const multiplier = getMultiplier(e.name);
            if (multiplier !== null && multiplier !== 1) ikey = multiplier + "×";
        }

        const countryIndex = findCountryIndex(e.name);
        const findKey = countryIndex === -1 ? null : [true, outList[countryIndex]];

        let firstName = "",
            nNames = "";
        if (nf) {
            firstName = FNAME;
        } else {
            nNames = FNAME;
        }
        if (findKey?.[1]) {
            const findKeyValue = findKey[1];
            let keyover = [],
                usflag = "";
            if (addflag) {
                const index = outList.indexOf(findKeyValue);
                if (index !== -1) {
                    usflag = FG[index];
                }
            }
            keyover = keyover
                // .concat(firstName, usflag, nNames, findKeyValue, "【YoungYannick】", retainKey, ikey, ikeys)
                .concat(firstName, usflag, nNames, findKeyValue, retainKey, ikey, ikeys)
                .filter((k) => k !== "");
            e.name = keyover.join(FGF);
        } else {
            if (nm) {
                const matchNum = e.name.match(/\d+$/);
                const num = matchNum ? matchNum[0] : "01";
                // e.name = '️🇺🇳 未知 【YoungYannick】'+ num;
                e.name = "🇺🇳 未知 " + num;
                e.isUnknown = true;
            } else {
                e.name = null;
            }
        }
    });
    pro = pro.filter((e) => e.name !== null);

    if (keepOrder) {
        add_sequence_in_order(pro);
    } else {
        jxh(pro);
        blpx && (pro = fampx(pro));
    }
    numone && oneP(pro);

    key && (pro = pro.filter((e) => !keyb.test(e.name)));
    return pro;
}

// prettier-ignore
function getList(arg) { switch (arg) { case 'us': return EN; case 'gq': return FG; case 'quan': return QC; default: return ZH; } }
// prettier-ignore
function jxh(e) {
    const knownNodes = e.filter(node => !node.isUnknown);
    const unknownNodes = e.filter(node => node.isUnknown);

    const grouped = knownNodes.reduce((acc, node) => {
        const baseName = node.name.replace(/\d+$/, '').trim();
        if (!acc[baseName]) {
            acc[baseName] = [];
        }
        acc[baseName].push(node);
        return acc;
    }, {});

    const result = [];
    for (const baseName in grouped) {
        const nodes = grouped[baseName];
        nodes.sort((a, b) => {
            const numA = parseInt(a.name.match(/\d+$/) || 0);
            const numB = parseInt(b.name.match(/\d+$/) || 0);
            return numA - numB;
        });

        const maxDigits = Math.max(...nodes.map(node => (node.name.match(/\d+$/) || ['0'])[0].length));
        const padLength = maxDigits > 1 ? maxDigits : 2;

        nodes.forEach((node, index) => {
            const paddedIndex = (index + 1).toString().padStart(padLength, '0');
            node.name = `${baseName}${XHFGF}${paddedIndex}`;
            result.push(node);
        });
    }

    result.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));

    unknownNodes.forEach((node, index) => {
        const paddedIndex = (index + 1).toString().padStart(2, '0');
        node.name = `🇺🇳 未知 ${paddedIndex}`;
    });

    result.push(...unknownNodes);
    e.splice(0, e.length, ...result);
    e.forEach(node => delete node.isUnknown);
    return e;
}

function add_sequence_in_order(pro) {
    const knownNodes = pro.filter(node => !node.isUnknown);
    const unknownNodes = pro.filter(node => node.isUnknown);

    const groups = knownNodes.reduce((acc, node) => {
        // 使用与jxh相同的逻辑获取基础名称
        const baseName = node.name.replace(/\d+$/, '').trim();
        if (!acc[baseName]) {
            acc[baseName] = [];
        }
        acc[baseName].push(node);
        return acc;
    }, {});

    const paddingMap = {};
    for (const baseName in groups) {
        const count = groups[baseName].length;
        paddingMap[baseName] = Math.max(count.toString().length, 2);
    }

    const counters = {};
    knownNodes.forEach(node => {
        const baseName = node.name.replace(/\d+$/, '').trim();
        // 递增当前基础名称的计数器
        counters[baseName] = (counters[baseName] || 0) + 1;
        const index = counters[baseName];

        const padLength = paddingMap[baseName];
        const paddedIndex = index.toString().padStart(padLength, '0');

        node.name = `${baseName}${XHFGF}${paddedIndex}`;
    });

    unknownNodes.forEach((node, index) => {
        const paddedIndex = (index + 1).toString().padStart(2, '0');
        node.name = `🇺🇳 未知 ${paddedIndex}`;
    });
    pro.forEach(node => delete node.isUnknown);

    return pro;
}


// prettier-ignore
function oneP(e) { const t = e.reduce((e, t) => { const n = t.name.replace(/[^A-Za-z0-9\u00C0-\u017F\u4E00-\u9FFF]+\d+$/, ""); if (!e[n]) { e[n] = []; } e[n].push(t); return e; }, {}); for (const e in t) { if (t[e].length === 1 && t[e][0].name.endsWith("01")) { t[e][0].name = t[e][0].name.replace(/[^.]01/, ""); } } return e; }
// prettier-ignore
function fampx(pro) { const wis = []; const wnout = []; for (const proxy of pro) { const fan = specialRegex.some((regex) => regex.test(proxy.name)); if (fan) { wis.push(proxy); } else { wnout.push(proxy); } } const sps = wis.map((proxy) => specialRegex.findIndex((regex) => regex.test(proxy.name))); wis.sort((a, b) => sps[wis.indexOf(a)] - sps[wis.indexOf(b)] || a.name.localeCompare(b.name)); wnout.sort((a, b) => pro.indexOf(a) - pro.indexOf(b)); return wnout.concat(wis); }