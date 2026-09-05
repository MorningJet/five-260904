import { SHENG, WUXING_LABEL, type Wuxing } from "@/lib/bazi/constants";
import type { Product } from "@/lib/types";
import catalogProducts from "@/data/products.json";

export type PairCopy = {
  title: string;
  reason: string;
};

const TITLE_HEADS = [
  "好搭", "順心", "同氣", "互補", "穩當", "聚財", "和氣", "貼心", "齊心", "顧本",
  "守財", "旺運", "省心", "對味", "合拍", "添福", "招財", "平安", "圓滿", "進帳",
  "暖心", "踏實", "輕鬆", "長久", "互助",
] as const;

const TITLE_TAILS = [
  "一對", "成雙", "好緣", "財路", "日子", "氣場", "手串", "搭配", "良伴", "夥伴",
  "福氣", "運勢", "心意", "默契", "本錢", "來往", "相處", "進益", "安穩", "吉祥",
  "和順", "生財", "護身", "添彩", "好命",
] as const;

const SMOOTH = [
  "彼此比較少抬槓，話說開比較順。",
  "意見不合比較快收得住，比較少翻舊帳。",
  "步調比較齊，比較少互相拖後腿。",
  "遇事比較肯先聽完，比較不會搶著下結論。",
  "相處比較有耐心，對方慢半拍時比較不會翻臉。",
  "拌嘴來得快、收得也快，比較不會隔夜結冰。",
  "誰累了比較看得出來，也比較肯先停一停。",
  "氣氛比較穩，比較少無謂的試探。",
  "對方小習慣比較吞得下去，比較少唸個沒完。",
  "想安靜時比較被理解，空間拿捏比較剛好。",
  "出門在外比較會幫對方說話，比較少拆台。",
  "心情不好時比較懂迴避，比較不會硬問。",
  "久了也不易膩，來往還是比較有溫度。",
  "對方改主意時比較彈性，比較少硬槓。",
  "做事比較合拍，比較少各執一詞。",
  "彼此比較肯讓一步，關係比較順遂。",
  "聊天比較對得上，比較少各說各的。",
  "有事肯幫忙、沒事不黏人，分寸比較剛好。",
  "信任來得穩，比較不是忽冷忽熱。",
  "細節裡比較有心，相處比較不虛。",
  "壓力來時比較扛得住，比較少先內鬨。",
  "講得開、聽得進，來往比較清爽。",
  "對方選擇比較被尊重，比較少勸人「你應該」。",
  "慶祝對方的好事真心，比較不酸。",
  "日子過得比較踏實，關係比較順。",
];

const WEALTH = [
  "財運偏守成，漏財跟衝動購物都比較收得住。",
  "大筆開銷比較會先商量，比較少事後才攤牌。",
  "該花的花、該留的留，比較不互相攀比。",
  "正財來得穩，比較不靠賭運氣。",
  "偏財口收一收，投資比較不會一次押太多。",
  "日常小錢不計較，大錢才一起盯。",
  "漏財的口較小，花錢比較有分寸。",
  "存錢目標講得開，步調比較齊。",
  "急用時彼此肯撐，事後也比較會補回來。",
  "收入跟開銷比較看得清楚，比較少糊成一團。",
  "風險來時比較會踩煞車，財運走得穩。",
  "小錢進得來、大錢守得住，財運比較穩。",
  "該守的守、該放的放，花錢比較不心慌。",
  "財路比較清，比較少一時起鬨。",
  "花錢有分寸，比較不容易漏財。",
  "兩人對錢的看法比較談得開。",
  "財運走得穩，比較少大起大落。",
  "該留的留得住，比較不會一時花光。",
  "開銷比較清楚，比較少糊裡糊塗。",
  "正財路比較順，偏財口比較小。",
  "比較會一起看帳，比較少各花各的到心虛。",
  "投資比較謹慎，比較不會一次押太多。",
  "財運偏穩，比較少靠運氣硬衝。",
  "花錢有數，比較不會互相攀比。",
  "小錢不計較，大錢才一起看。",
  "財運走得順，漏財比較收得住。",
];

function pairKey(idA: string, idB: string) {
  return idA < idB ? `${idA}|${idB}` : `${idB}|${idA}`;
}

function ordered(a: Product, b: Product): [Product, Product] {
  return a.id <= b.id ? [a, b] : [b, a];
}

function titleAt(index: number) {
  return `${TITLE_HEADS[index % TITLE_HEADS.length]}${TITLE_TAILS[Math.floor(index / TITLE_HEADS.length) % TITLE_TAILS.length]}`;
}

function elementPhrase(left: Wuxing, right: Wuxing) {
  const la = WUXING_LABEL[left];
  const lb = WUXING_LABEL[right];
  if (left === right) return `兩串同屬${la}，氣場相近`;
  if (SHENG[left] === right || SHENG[right] === left) return `一串屬${la}、一串屬${lb}，相生互補`;
  return `一串屬${la}、一串屬${lb}，以喜用相制`;
}

function writeReason(first: Product, second: Product, index: number) {
  const smooth = SMOOTH[index % SMOOTH.length];
  const wealth = WEALTH[Math.floor(index / SMOOTH.length) % WEALTH.length];
  return `「${first.name}」與「${second.name}」成對，${elementPhrase(first.element, second.element)}。配戴後${smooth}${wealth}`;
}

const catalog: Map<string, PairCopy> = (() => {
  const list = (catalogProducts as Product[]).slice().sort((x, y) => x.id.localeCompare(y.id));
  const map = new Map<string, PairCopy>();
  let i = 0;
  for (let a = 0; a < list.length; a++) {
    for (let b = a + 1; b < list.length; b++) {
      const left = list[a];
      const right = list[b];
      if (!left || !right) continue;
      map.set(pairKey(left.id, right.id), {
        title: titleAt(i),
        reason: writeReason(left, right, i),
      });
      i += 1;
    }
  }
  return map;
})();

export function getPairCopy(left: Product, right: Product): PairCopy {
  const found = catalog.get(pairKey(left.id, right.id));
  if (found) return found;
  const [first, second] = ordered(left, right);
  const fallback = Number.parseInt(`${first.id}${second.id}`.replace(/\D/g, ""), 10) || 0;
  return {
    title: `${first.name} \u00b7 ${second.name}`,
    reason: writeReason(first, second, fallback),
  };
}

export function pairCatalogSize() {
  return catalog.size;
}
