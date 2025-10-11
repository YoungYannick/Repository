/**
 * ## 主要参数
 * - `in`：指定输入节点名的类型。默认自动检测，优先级：中文 -> 国旗 -> 英文全称 -> 英文缩写。
 * - 可选值：
 * - `zh` 或 `cn`：中文
 * - `en` 或 `us`：英文缩写
 * - `flag` 或 `gq`：国旗
 * - `quan`：英文全称
 * - `out`：指定输出节点名的格式。默认为 `cn`（中文）。
 * - 可选值：
 * - `cn` 或 `zh`：中文
 * - `us` 或 `en`：英文缩写
 * - `gq` 或 `flag`：国旗
 * - `quan`：英文全称
 * - `nm`：保留未匹配到的节点名。默认为 `true`（保留）。
 *
 * ## 分隔符参数
 * - `fgf`：节点名前缀或国旗分隔符。默认为空格。
 * - `sn`：国家与序号间的分隔符。默认为空格。
 *
 * ## 序号参数
 * - `one`：清理只有一个节点的地区的 "01" 后缀。默认为 `false`（不清理）。
 * - `flag`：节点名前添加国旗。默认为 `true`（添加）。
 *
 * ## 排序参数 【新增】
 * - `order`：保留订阅内节点的原始顺序，不进行分组排序。默认为 `false`。
 * - `true`: 保留原始顺序
 * - `false`: 按名称分组排序
 *
 * ## 前缀参数
 * - `name`：节点名前添加机场名称前缀。默认为空。
 * - `nf`：将 `name` 的前缀置于最前。默认为 `false`。
 *
 * ## 保留参数
 * - `blkey`：保留节点名中的自定义关键词，用 "+" 分隔，支持替换（如 `GPT>新名字`）。
 * - 示例：`#blkey=iplc+GPT>新名字+NF`
 * - `blgd`：保留特定标识（如 "家宽"、"IPLC"）。默认为 `false`。
 * - `bl`：正则匹配保留倍率标识（如 "2x"、"3倍"）。默认为 `false`。
 * - `nx`：保留 1 倍率及不显示倍率的节点。默认为 `false`。
 * - `blnx`：仅保留高倍率节点（大于 1 倍）。默认为 `false`。
 * - `clear`：清理乱七八糟的名称（如含 "套餐"、"到期"）。默认为 `true`（清理）。
 * - `blpx`：对 `bl` 保留的标识后的名称分组排序（需与 `bl` 配合）。默认为 `false`。
 * - `blockquic`：控制 QUIC 阻止，`on` 表示阻止，`off` 表示不阻止。默认为不设置。
 *
 * ## 默认行为
 * 当不提供任何参数时，脚本的行为如下：
 * - 按名称分组排序
 * - 自动检测输入节点名类型（优先级：中文 -> 国旗 -> 英文全称 -> 英文缩写）
 * - 输出节点名格式为中文
 * - 保留未匹配到的节点名
 * - 分隔符为默认值（空格）
 * - 不清理 "01" 后缀
 * - 节点名前添加国旗
 * - 不添加机场名称前缀
 * - 不保留自定义关键词
 * - 不保留特定标识
 * - 不保留倍率标识
 * - 不保留 1 倍率及不显示倍率的节点
 * - 不仅保留高倍率节点（即不过滤）
 * - 清理乱七八糟的名称
 * - 不对保留的标识后的名称分组排序
 * - 不控制 QUIC 阻止
 *
 * ## 使用示例
 * 1. 默认行为（自动排序）：
 * - `https://raw.githubusercontent.com/YoungYannick/Repository/master/proxy/sub_store/rename.js`
 * 2. 保留原始顺序：
 * - `https://raw.githubusercontent.com/YoungYannick/Repository/master/proxy/sub_store/rename.js#order=true`
 * 3. 指定输入为国旗，输出为英文缩写：
 * - `https://raw.githubusercontent.com/YoungYannick/Repository/master/proxy/sub_store/rename.js#in=flag&out=en`
 * 4. 不保留未匹配节点并添加机场名称前缀：
 * - `https://raw.githubusercontent.com/YoungYannick/Repository/master/proxy/sub_store/rename.js#nm=false&name=机场名`
 * 5. 保留自定义关键词并替换：
 * - `https://raw.githubusercontent.com/YoungYannick/Repository/master/proxy/sub_store/rename.js#blkey=GPT>新名字+NF`
 */

const inArg = $arguments;
const nx = inArg.nx || false,
    bl = inArg.bl || false,
    nf = inArg.nf || false,
    key = inArg.key || false,
    blgd = inArg.blgd || false,
    blpx = inArg.blpx || false,
    blnx = inArg.blnx || false,
    numone = inArg.one || false,
    debug = inArg.debug || false,
    keepOrder = inArg.order || false, // 【新增】读取 order 参数
    clear = inArg.clear !== undefined ? inArg.clear : true, // 默认清理乱七八糟的名称
    addflag = inArg.flag !== undefined ? inArg.flag : true,
    nm = inArg.nm !== undefined ? inArg.nm : true; // 默认保留未匹配到的节点名

const FGF = inArg.fgf == undefined ? " " : decodeURI(inArg.fgf),
    XHFGF = inArg.sn == undefined ? " " : decodeURI(inArg.sn),
    FNAME = inArg.name == undefined ? "" : decodeURI(inArg.name),
    BLKEY = inArg.blkey == undefined ? "" : decodeURI(inArg.blkey),
    blockquic = inArg.blockquic == undefined ? "" : decodeURI(inArg.blockquic),
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
const FG = ['🇨🇳', '🇭🇰', '🇲🇴', '🇹🇼', '🇯🇵', '🇰🇷', '🇸🇬', '🇺🇸', '🇬🇧', '🇫🇷', '🇩🇪', '🇦🇺', '🇦🇪', '🇦🇫', '🇦🇱', '🇩🇿', '🇦🇴', '🇦🇷', '🇦🇲', '🇦🇹', '🇦🇿', '🇧🇭', '🇧🇩', '🇧🇾', '🇧🇪', '🇧🇿', '🇧🇯', '🇧🇹', '🇧🇴', '🇧🇦', '🇧🇼', '🇧🇷', '🇻🇬', '🇧🇳', '🇧🇬', '🇧🇫', '🇧🇮', '🇰🇭', '🇨🇲', '🇨🇦', '🇨🇻', '🇰🇾', '🇨🇫', '🇹🇩', '🇨🇱', '🇨🇴', '🇰🇲', '🇨🇬', '🇨🇩', '🇨🇷', '🇭🇷', '🇨🇾', '🇨🇿', '🇩🇰', '🇩🇯', '🇩🇴', '🇪🇨', '🇪🇬', '🇸🇻', '🇬🇶', '🇪🇷', '🇪🇪', '🇪🇹', '🇫🇯', '🇫🇮', '🇬🇦', '🇬🇲', '🇬🇪', '🇬🇭', '🇬🇷', '🇬🇱', '🇬🇹', '🇬🇳', '🇬🇾', '🇭🇹', '🇭🇳', '🇭🇺', '🇮🇸', '🇮🇳', '🇮🇩', '🇮🇷', '🇮🇶', '🇮🇪', '🇮🇲', '🇮🇱', '🇮🇹', '🇨🇮', '🇯🇲', '🇯🇴', '🇰🇿', '🇰🇪', '🇰🇼', '🇰🇬', '🇱🇪', '🇱🇻', '🇱🇧', '🇱🇸', '🇱🇷', '🇱🇾', '🇱🇹', '🇱🇺', '🇲🇰', '🇲🇬', '🇲🇼', '🇲🇾', '🇲🇻', '🇲🇱', '🇲🇹', '🇲🇷', '🇲🇺', '🇲🇽', '🇲🇩', '🇲🇨', '🇲🇳', '🇲🇪', '🇲🇦', '🇲🇿', '🇲🇲', '🇳🇦', '🇳🇵', '🇳🇱', '🇳🇿', '🇳🇮', '🇳🇪', '🇳🇬', '🇰🇵', '🇳🇴', '🇴🇲', '🇵🇰', '🇵🇦', '🇵🇾', '🇵🇪', '🇵🇭', '🇵🇹', '🇵🇷', '🇶🇦', '🇷🇴', '🇷🇺', '🇷🇼', '🇸🇲', '🇸🇦', '🇸🇳', '🇷🇸', '🇸🇱', '🇸🇰', '🇸🇮', '🇸🇴', '🇿🇦', '🇪🇸', '🇱🇰', '🇸🇩', '🇸🇷', '🇸🇿', '🇸🇪', '🇨🇭', '🇸🇾', '🇹🇯', '🇹🇿', '🇹🇭', '🇹🇬', '🇹🇴', '🇹🇹', '🇹🇳', '🇹🇷', '🇹🇲', '🇻🇮', '🇺🇬', '🇺🇦', '🇺🇾', '🇺🇿', '🇻🇪', '🇻🇳', '🇾🇪', '🇿🇲', '🇿🇼', '🇦🇩', '🇷🇪', '🇵🇱', '🇬🇺', '🇻🇦', '🇱🇮', '🇨🇼', '🇸🇨', '🇦🇶', '🇬🇮', '🇨🇺', '🇫🇴', '🇦🇽', '🇧🇲', '🇹🇱'];
// prettier-ignore
const EN = ['CN', 'HK', 'MO', 'TW', 'JP', 'KR', 'SG', 'US', 'GB', 'FR', 'DE', 'AU', 'AE', 'AF', 'AL', 'DZ', 'AO', 'AR', 'AM', 'AT', 'AZ', 'BH', 'BD', 'BY', 'BE', 'BZ', 'BJ', 'BT', 'BO', 'BA', 'BW', 'BR', 'VG', 'BN', 'BG', 'BF', 'BI', 'KH', 'CM', 'CA', 'CV', 'KY', 'CF', 'TD', 'CL', 'CO', 'KM', 'CG', 'CD', 'CR', 'HR', 'CY', 'CZ', 'DK', 'DJ', 'DO', 'EC', 'EG', 'SV', 'GQ', 'ER', 'EE', 'ET', 'FJ', 'FI', 'GA', 'GM', 'GE', 'GH', 'GR', 'GL', 'GT', 'GN', 'GY', 'HT', 'HN', 'HU', 'IS', 'IN', 'ID', 'IR', 'IQ', 'IE', 'IM', 'IL', 'IT', 'CI', 'JM', 'JO', 'KZ', 'KE', 'KW', 'KG', 'LA', 'LV', 'LB', 'LS', 'LR', 'LY', 'LT', 'LU', 'MK', 'MG', 'MW', 'MY', 'MV', 'ML', 'MT', 'MR', 'MU', 'MX', 'MD', 'MC', 'MN', 'ME', 'MA', 'MZ', 'MM', 'NA', 'NP', 'NL', 'NZ', 'NI', 'NE', 'NG', 'KP', 'NO', 'OM', 'PK', 'PA', 'PY', 'PE', 'PH', 'PT', 'PR', 'QA', 'RO', 'RU', 'RW', 'SM', 'SA', 'SN', 'RS', 'SL', 'SK', 'SI', 'SO', 'ZA', 'ES', 'LK', 'SD', 'SR', 'SZ', 'SE', 'CH', 'SY', 'TJ', 'TZ', 'TH', 'TG', 'TO', 'TT', 'TN', 'TR', 'TM', 'VI', 'UG', 'UA', 'UY', 'UZ', 'VE', 'VN', 'YE', 'ZM', 'ZW', 'AD', 'RE', 'PL', 'GU', 'VA', 'LI', 'CW', 'SC', 'AQ', 'GI', 'CU', 'FO', 'AX', 'BM', 'TL'];
// prettier-ignore
const ZH = ['中国', '香港', '澳门', '台湾', '日本', '韩国', '新加坡', '美国', '英国', '法国', '德国', '澳大利亚', '阿联酋', '阿富汗', '阿尔巴尼亚', '阿尔及利亚', '安哥拉', '阿根廷', '亚美尼亚', '奥地利', '阿塞拜疆', '巴林', '孟加拉国', '白俄罗斯', '比利时', '伯利兹', '贝宁', '不丹', '玻利维亚', '波斯尼亚和黑塞哥维那', '博茨瓦纳', '巴西', '英属维京群岛', '文莱', '保加利亚', '布基纳法索', '布隆迪', '柬埔寨', '喀麦隆', '加拿大', '佛得角', '开曼群岛', '中非共和国', '乍得', '智利', '哥伦比亚', '科摩罗', '刚果(布)', '刚果(金)', '哥斯达黎加', '克罗地亚', '塞浦路斯', '捷克', '丹麦', '吉布提', '多米尼加共和国', '厄瓜多尔', '埃及', '萨尔瓦多', '赤道几内亚', '厄立特里亚', '爱沙尼亚', '埃塞俄比亚', '斐济', '芬兰', '加蓬', '冈比亚', '格鲁吉亚', '加纳', '希腊', '格陵兰', '危地马拉', '几内亚', '圭亚那', '海地', '洪都拉斯', '匈牙利', '冰岛', '印度', '印尼', '伊朗', '伊拉克', '爱尔兰', '马恩岛', '以色列', '意大利', '科特迪瓦', '牙买加', '约旦', '哈萨克斯坦', '肯尼亚', '科威特', '吉尔吉斯斯坦', '老挝', '拉脱维亚', '黎巴嫩', '莱索托', '利比里亚', '利比亚', '立陶宛', '卢森堡', '马其顿', '马达加斯加', '马拉维', '马来', '马尔代夫', '马里', '马耳他', '毛利塔尼亚', '毛里求斯', '墨西哥', '摩尔多瓦', '摩纳哥', '蒙古', '黑山共和国', '摩洛哥', '莫桑比克', '缅甸', '纳米比亚', '尼泊尔', '荷兰', '新西兰', '尼加拉瓜', '尼日尔', '尼日利亚', '朝鲜', '挪威', '阿曼', '巴基斯坦', '巴拿马', '巴拉圭', '秘鲁', '菲律宾', '葡萄牙', '波多黎各', '卡塔尔', '罗马尼亚', '俄罗斯', '卢旺达', '圣马力诺', '沙特阿拉伯', '塞内加尔', '塞尔维亚', '塞拉利昂', '斯洛伐克', '斯洛文尼亚', '索马里', '南非', '西班牙', '斯里兰卡', '苏丹', '苏里南', '斯威士兰', '瑞典', '瑞士', '叙利亚', '塔吉克斯坦', '坦桑尼亚', '泰国', '多哥', '汤加', '特立尼达和多巴哥', '突尼斯', '土耳其', '土库曼斯坦', '美属维尔京群岛', '乌干达', '乌克兰', '乌拉圭', '乌兹别克斯坦', '委内瑞拉', '越南', '也门', '赞比亚', '津巴布韦', '安道尔', '留尼汪', '波兰', '关岛', '梵蒂冈', '列支敦士登', '库拉索', '塞舌尔', '南极', '直布罗陀', '古巴', '法罗群岛', '奥兰群岛', '百慕达', '东帝汶'];
// prettier-ignore
const QC = ['China', 'Hong Kong', 'Macao', 'Taiwan', 'Japan', 'Korea', 'Singapore', 'United States', 'United Kingdom', 'France', 'Germany', 'Australia', 'Dubai', 'Afghanistan', 'Albania', 'Algeria', 'Angola', 'Argentina', 'Armenia', 'Austria', 'Azerbaijan', 'Bahrain', 'Bangladesh', 'Belarus', 'Belgium', 'Belize', 'Benin', 'Bhutan', 'Bolivia', 'Bosnia and Herzegovina', 'Botswana', 'Brazil', 'British Virgin Islands', 'Brunei', 'Bulgaria', 'Burkina-faso', 'Burundi', 'Cambodia', 'Cameroon', 'Canada', 'CapeVerde', 'CaymanIslands', 'Central African Republic', 'Chad', 'Chile', 'Colombia', 'Comoros', 'Congo-Brazzaville', 'Congo-Kinshasa', 'CostaRica', 'Croatia', 'Cyprus', 'Czech Republic', 'Denmark', 'Djibouti', 'Dominican Republic', 'Ecuador', 'Egypt', 'EISalvador', 'Equatorial Guinea', 'Eritrea', 'Estonia', 'Ethiopia', 'Fiji', 'Finland', 'Gabon', 'Gambia', 'Georgia', 'Ghana', 'Greece', 'Greenland', 'Guatemala', 'Guinea', 'Guyana', 'Haiti', 'Honduras', 'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Isle of Man', 'Israel', 'Italy', 'Ivory Coast', 'Jamaica', 'Jordan', 'Kazakstan', 'Kenya', 'Kuwait', 'Kyrgyzstan', 'Laos', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Lithuania', 'Luxembourg', 'Macedonia', 'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta', 'Mauritania', 'Mauritius', 'Mexico', 'Moldova', 'Monaco', 'Mongolia', 'Montenegro', 'Morocco', 'Mozambique', 'Myanmar(Burma)', 'Namibia', 'Nepal', 'Netherlands', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'NorthKorea', 'Norway', 'Oman', 'Pakistan', 'Panama', 'Paraguay', 'Peru', 'Philippines', 'Portugal', 'PuertoRico', 'Qatar', 'Romania', 'Russia', 'Rwanda', 'SanMarino', 'SaudiArabia', 'Senegal', 'Serbia', 'SierraLeone', 'Slovakia', 'Slovenia', 'Somalia', 'SouthAfrica', 'Spain', 'SriLanka', 'Sudan', 'Suriname', 'Swaziland', 'Sweden', 'Switzerland', 'Syria', 'Tajikstan', 'Tanzania', 'Thailand', 'Togo', 'Tonga', 'TrinidadandTobago', 'Tunisia', 'Turkey', 'Turkmenistan', 'U.S.Virgin Islands', 'Uganda', 'Ukraine', 'Uruguay', 'Uzbekistan', 'Venezuela', 'Vietnam', 'Yemen', 'Zambia', 'Zimbabwe', 'Andorra', 'Reunion', 'Poland', 'Guam', 'Vatican', 'Liechtensteins', 'Curacao', 'Seychelles', 'Antarctica', 'Gibraltar', 'Cuba', 'Faroe Islands', 'Ahvenanmaa', 'Bermuda', 'Timor-Leste'];

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
const nameblnx = /(高倍|(?!1)2+(x|倍)|ˣ²|ˣ³|ˣ⁴|ˣ⁵|ˣ¹⁰)/i;
const namenx = /(高倍|(?!1)(0\.|\d)+(x|倍)|ˣ²|ˣ³|ˣ⁴|ˣ⁵|ˣ¹⁰)/i;
const keya =
    /港|Hong|HK|新加坡|SG|Singapore|日本|Japan|JP|美国|United States|US|韩|土耳其|TR|Turkey|Korea|KR|🇸🇬|🇭🇰|🇯🇵|🇺🇸|🇰🇷|🇹🇷/i;
const keyb =
    /(((1|2|3|4)\d)|(香港|Hong|HK) 0[5-9]|((新加坡|SG|Singapore|日本|Japan|JP|美国|United States|US|韩|土耳其|TR|Turkey|Korea|KR) 0[3-9]))/i;
const rurekey = {
    GB: /UK/g,
    "B-G-P": /BGP/g,
    "Russia Moscow": /Moscow/g,
    "Korea Chuncheon": /Chuncheon|Seoul/g,
    "Hong Kong": /Hongkong|HONG KONG/gi,
    "United Kingdom London": /London|Great Britain/g,
    "Dubai United Arab Emirates": /United Arab Emirates/g,
    "Taiwan TW 台湾 🇹🇼": /(台|Tai\s?wan|TW).*?🇨🇳|🇨🇳.*?(台|Tai\s?wan|TW)/g,
    "United States": /USA|Los Angeles|San Jose|Silicon Valley|Michigan/g,
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
    Taiwan: /Taipei/g,
    韩国: /春川|韩|首尔/g,
    Japan: /Tokyo|Osaka/g,
    英国: /伦敦/g,
    India: /Mumbai/g,
    Germany: /Frankfurt/g,
    Switzerland: /Zurich/g,
    俄罗斯: /莫斯科/g,
    土耳其: /伊斯坦布尔/g,
    泰国: /泰國|曼谷/g,
    法国: /巴黎/g,
    G: /\d\s?GB/gi,
    Esnc: /esnc/gi
};

let GetK = false, AMK = [];
function ObjKA(i) {
    GetK = true;
    AMK = Object.entries(i);
}

function operator(pro) {
    const Allmap = {};
    const outList = getList(outputName);
    let inputList,
        retainKey = "";
    if (inname !== "") {
        inputList = [getList(inname)];
    } else {
        inputList = [ZH, FG, QC, EN];
    }

    inputList.forEach((arr) => {
        arr.forEach((value, valueIndex) => {
            Allmap[value] = outList[valueIndex];
        });
    });

    if (clear || nx || blnx || key) {
        pro = pro.filter((res) => {
            const resname = res.name;
            const shouldKeep =
                !(clear && nameclear.test(resname)) &&
                !(nx && namenx.test(resname)) &&
                !(blnx && !nameblnx.test(resname)) &&
                !(key && !(keya.test(resname) && /2|4|6|7/i.test(resname)));
            return shouldKeep;
        });
    }

    const BLKEYS = BLKEY ? BLKEY.split("+") : "";

    pro.forEach((e) => {
        let bktf = false, ens = e.name;
        Object.keys(rurekey).forEach((ikey) => {
            if (rurekey[ikey].test(e.name)) {
                e.name = e.name.replace(rurekey[ikey], ikey);
                if (BLKEY) {
                    bktf = true;
                    let BLKEY_REPLACE = "",
                        re = false;
                    BLKEYS.forEach((i) => {
                        if (i.includes(">") && ens.includes(i.split(">")[0])) {
                            if (rurekey[ikey].test(i.split(">")[0])) {
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
            const match = e.name.match(
                /((倍率|X|x|×)\D?((\d{1,3}\.)?\d+)\D?)|((\d{1,3}\.)?\d+)(倍|X|x|×)/
            );
            if (match) {
                const rev = match[0].match(/(\d[\d.]*)/)[0];
                if (rev !== "1") {
                    const newValue = rev + "×";
                    ikey = newValue;
                }
            }
        }

        !GetK && ObjKA(Allmap);
        const findKey = AMK.find(([key]) => e.name.includes(key));

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
                e.name = '️🇺🇳 未知'+ num;
                e.isUnknown = true;
            } else {
                e.name = null;
            }
        }
    });
    pro = pro.filter((e) => e.name !== null);

    // 即使 keepOrder = true，也执行编号，但不排序
    jxh(pro);
    numone && oneP(pro);
    if (!keepOrder && blpx) pro = fampx(pro);

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
        node.name = `️🇺🇳 未知 ${paddedIndex}`;
    });

    result.push(...unknownNodes);
    e.splice(0, e.length, ...result);
    e.forEach(node => delete node.isUnknown);
    return e;
}
// prettier-ignore
function oneP(e) { const t = e.reduce((e, t) => { const n = t.name.replace(/[^A-Za-z0-9\u00C0-\u017F\u4E00-\u9FFF]+\d+$/, ""); if (!e[n]) { e[n] = []; } e[n].push(t); return e; }, {}); for (const e in t) { if (t[e].length === 1 && t[e][0].name.endsWith("01")) { t[e][0].name = t[e][0].name.replace(/[^.]01/, ""); } } return e; }
// prettier-ignore
function fampx(pro) { const wis = []; const wnout = []; for (const proxy of pro) { const fan = specialRegex.some((regex) => regex.test(proxy.name)); if (fan) { wis.push(proxy); } else { wnout.push(proxy); } } const sps = wis.map((proxy) => specialRegex.findIndex((regex) => regex.test(proxy.name))); wis.sort((a, b) => sps[wis.indexOf(a)] - sps[wis.indexOf(b)] || a.name.localeCompare(b.name)); wnout.sort((a, b) => pro.indexOf(a) - pro.indexOf(b)); return wnout.concat(wis); }