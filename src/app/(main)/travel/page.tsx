'use client';

import { useState, useCallback, useRef, useMemo } from 'react';
import {
  Map, Globe, MapPin, Plane, UtensilsCrossed, Landmark, Trees,
  X, Navigation, Sparkles, Compass,
  ZoomIn, ZoomOut, RotateCcw, Footprints, Telescope, Edit3, Trash2,
} from 'lucide-react';
import { useTravel } from '@/hooks/useTravel';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

// ══════════════════════════════════════════════════════════════
// Standard SVG country paths   (1000×500 viewBox)
// Each country has organic coastlines with internal borders
// ══════════════════════════════════════════════════════════════

interface CountryGeo {
  id: string;
  nameZh: string;
  path: string;
}

const COUNTRIES: CountryGeo[] = [
  // ── North America ──
  { id: 'can', nameZh: '加拿大', path: 'M 70 100 Q 90 65 120 48 Q 160 30 200 32 Q 250 35 280 48 Q 310 60 320 80 L 330 100 L 335 115 L 310 118 Q 300 105 285 100 L 270 95 L 260 88 L 240 82 Q 220 78 200 82 L 180 90 Q 160 100 150 115 L 140 130 Q 130 140 120 135 L 100 128 Q 80 118 70 100 Z' },
  { id: 'usa', nameZh: '美国', path: 'M 130 135 Q 140 128 150 118 L 165 100 Q 180 90 200 82 L 220 78 Q 240 82 260 88 L 280 100 Q 295 108 310 118 L 320 125 L 328 130 L 325 150 Q 320 170 315 185 L 305 195 Q 290 200 280 210 L 270 215 L 260 218 L 255 225 Q 245 235 235 230 L 225 225 L 215 215 Q 200 200 185 195 L 170 190 Q 155 185 148 175 Q 140 168 135 155 L 130 145 Z' },
  { id: 'mex', nameZh: '墨西哥', path: 'M 148 175 Q 155 185 170 190 L 185 195 Q 200 200 215 215 L 225 225 L 235 230 L 245 242 L 240 260 Q 235 275 228 285 L 220 290 L 210 285 Q 200 275 195 265 L 190 255 Q 180 245 170 235 L 160 225 Q 152 215 148 205 L 145 190 Z' },
  { id: 'gtm', nameZh: '危地马拉', path: 'M 220 290 L 228 285 Q 235 275 240 285 L 242 295 Q 238 305 230 310 L 222 308 L 218 300 Z' },
  // ── South America ──
  { id: 'bra', nameZh: '巴西', path: 'M 245 300 L 255 295 Q 270 285 285 290 L 300 298 Q 315 305 325 320 L 330 340 Q 332 360 328 380 L 320 400 Q 310 415 295 425 L 280 430 Q 265 428 258 415 L 250 400 Q 242 380 240 360 L 238 340 Q 240 320 245 300 Z' },
  { id: 'arg', nameZh: '阿根廷', path: 'M 258 415 Q 265 428 280 430 L 295 425 Q 305 435 300 450 L 292 465 Q 280 472 268 468 L 255 458 Q 248 445 250 430 Z' },
  { id: 'chl', nameZh: '智利', path: 'M 250 400 Q 255 415 258 430 L 255 458 Q 252 468 245 465 L 240 455 Q 238 435 240 420 L 242 405 Z' },
  { id: 'col', nameZh: '哥伦比亚', path: 'M 240 285 Q 245 278 255 275 L 268 272 Q 278 275 282 285 Q 280 295 272 298 L 260 296 Q 250 294 245 290 Z' },
  { id: 'per', nameZh: '秘鲁', path: 'M 255 295 L 260 296 Q 272 298 280 295 L 288 300 Q 292 315 290 330 L 285 345 Q 278 355 270 350 L 262 340 Q 252 325 250 310 Z' },
  { id: 'ven', nameZh: '委内瑞拉', path: 'M 268 272 Q 278 265 288 270 L 295 278 Q 296 288 290 292 L 280 290 Q 272 285 268 280 Z' },
  { id: 'bol', nameZh: '玻利维亚', path: 'M 278 345 Q 285 338 295 342 L 302 350 Q 304 362 298 368 L 288 370 Q 278 365 274 355 Z' },
  { id: 'pry', nameZh: '巴拉圭', path: 'M 290 372 Q 298 365 308 370 L 312 380 Q 310 392 302 395 L 292 390 Q 286 380 290 372 Z' },
  { id: 'ury', nameZh: '乌拉圭', path: 'M 298 412 Q 305 408 312 415 L 314 425 Q 308 428 302 425 Z' },
  // ── Europe ──
  { id: 'gbr', nameZh: '英国', path: 'M 445 135 Q 455 128 462 135 Q 468 142 465 152 Q 460 162 452 165 Q 445 162 442 155 Q 438 148 445 135 Z' },
  { id: 'irl', nameZh: '爱尔兰', path: 'M 435 138 Q 440 132 446 138 L 448 148 Q 444 156 438 155 L 432 148 Q 430 140 435 138 Z' },
  { id: 'fra', nameZh: '法国', path: 'M 458 160 Q 465 155 472 158 L 482 162 Q 490 168 492 178 L 488 188 Q 482 195 474 198 L 465 195 Q 458 188 455 180 Z' },
  { id: 'deu', nameZh: '德国', path: 'M 472 145 Q 480 140 492 142 L 502 146 Q 510 152 508 162 L 502 170 Q 495 175 488 172 L 480 168 Q 472 162 470 155 Z' },
  { id: 'ita', nameZh: '意大利', path: 'M 480 178 Q 485 170 492 172 L 500 178 Q 505 188 502 198 L 496 208 Q 490 212 484 208 L 478 200 Q 474 190 480 178 Z' },
  { id: 'esp', nameZh: '西班牙', path: 'M 452 178 Q 458 172 468 175 L 478 180 Q 482 190 478 200 L 472 208 Q 462 212 455 208 L 448 200 Q 444 190 452 178 Z' },
  { id: 'prt', nameZh: '葡萄牙', path: 'M 444 190 Q 448 185 452 190 L 450 205 Q 448 212 443 208 L 438 200 Z' },
  { id: 'nld', nameZh: '荷兰', path: 'M 472 136 Q 478 132 484 136 L 486 142 L 480 145 Q 474 144 472 140 Z' },
  { id: 'bel', nameZh: '比利时', path: 'M 470 144 Q 474 140 478 145 L 480 150 Q 478 156 474 154 L 470 150 Z' },
  { id: 'che', nameZh: '瑞士', path: 'M 476 166 Q 480 162 486 164 L 490 170 Q 492 176 488 180 L 482 182 Q 476 178 474 172 Z' },
  { id: 'aut', nameZh: '奥地利', path: 'M 490 162 Q 496 158 504 160 L 508 168 Q 506 176 500 178 L 494 175 Q 488 170 490 162 Z' },
  { id: 'cze', nameZh: '捷克', path: 'M 490 145 Q 496 140 502 145 L 506 152 Q 504 158 498 160 L 490 156 Z' },
  { id: 'pol', nameZh: '波兰', path: 'M 502 140 Q 510 135 520 138 L 528 145 Q 530 155 525 162 L 518 165 Q 508 162 502 155 Z' },
  { id: 'ukr', nameZh: '乌克兰', path: 'M 518 140 Q 528 135 538 140 L 548 148 Q 552 158 548 168 L 540 175 Q 530 178 522 172 L 516 162 Q 512 150 518 140 Z' },
  { id: 'rou', nameZh: '罗马尼亚', path: 'M 522 168 Q 528 162 535 165 L 542 172 Q 545 182 540 192 L 532 198 Q 525 195 520 188 L 516 178 Z' },
  { id: 'hun', nameZh: '匈牙利', path: 'M 498 156 Q 505 150 512 156 L 516 164 Q 514 172 508 174 L 500 170 Q 494 164 498 156 Z' },
  { id: 'grc', nameZh: '希腊', path: 'M 530 192 Q 535 185 542 188 L 548 195 Q 550 205 546 212 L 540 218 Q 534 215 530 208 L 526 200 Z' },
  { id: 'nor', nameZh: '挪威', path: 'M 480 80 Q 490 68 502 72 L 512 80 Q 518 92 515 105 L 508 115 Q 498 118 490 112 L 482 102 Q 476 92 480 80 Z' },
  { id: 'swe', nameZh: '瑞典', path: 'M 495 78 Q 505 72 518 76 L 528 82 Q 535 95 532 108 L 525 118 Q 515 125 505 118 L 495 108 Q 488 95 495 78 Z' },
  { id: 'fin', nameZh: '芬兰', path: 'M 505 68 Q 515 58 528 62 L 538 70 Q 540 82 535 90 L 525 92 Q 515 88 508 80 Z' },
  { id: 'dnk', nameZh: '丹麦', path: 'M 482 125 Q 488 120 494 126 L 496 134 Q 492 138 486 136 L 480 130 Z' },
  { id: 'isl', nameZh: '冰岛', path: 'M 395 72 Q 405 62 418 68 L 422 82 Q 420 95 410 98 L 398 92 Q 388 82 395 72 Z' },
  // ── Russia ──
  { id: 'rus', nameZh: '俄罗斯', path: 'M 495 78 Q 518 60 550 48 Q 590 38 640 40 Q 690 42 730 52 Q 770 62 800 78 L 810 85 L 800 95 L 770 88 Q 740 82 700 78 L 650 75 Q 610 72 570 72 L 530 75 Q 510 78 495 78 Z' },
  // ── Middle East ──
  { id: 'tur', nameZh: '土耳其', path: 'M 542 178 Q 548 172 555 175 L 562 182 Q 565 192 560 200 L 554 208 Q 548 210 542 205 L 538 198 Q 536 188 542 178 Z' },
  { id: 'sau', nameZh: '沙特阿拉伯', path: 'M 560 200 Q 570 192 582 195 L 595 202 Q 605 215 600 230 L 592 245 Q 582 255 572 250 L 562 240 Q 555 228 556 215 Z' },
  { id: 'irn', nameZh: '伊朗', path: 'M 555 175 Q 565 168 578 172 L 590 178 Q 598 188 594 198 L 586 205 Q 576 208 568 202 L 558 195 Q 552 185 555 175 Z' },
  { id: 'irq', nameZh: '伊拉克', path: 'M 562 188 Q 568 182 576 186 L 582 194 Q 580 204 574 206 L 566 202 Q 560 194 562 188 Z' },
  { id: 'are', nameZh: '阿联酋', path: 'M 582 212 Q 590 208 598 215 Q 602 225 596 232 L 588 228 Z' },
  { id: 'isr', nameZh: '以色列', path: 'M 556 204 Q 560 200 564 206 L 562 214 Q 558 216 554 210 Z' },
  { id: 'jor', nameZh: '约旦', path: 'M 558 208 Q 564 204 568 210 L 566 220 Q 562 224 558 218 Z' },
  { id: 'yem', nameZh: '也门', path: 'M 576 238 Q 584 232 592 238 L 594 250 Q 590 258 582 256 L 574 248 Z' },
  // ── Africa ──
  { id: 'egy', nameZh: '埃及', path: 'M 540 220 Q 550 208 562 215 L 578 225 Q 585 235 582 248 L 575 255 Q 562 258 552 252 L 542 242 Q 535 230 540 220 Z' },
  { id: 'mar', nameZh: '摩洛哥', path: 'M 462 208 Q 472 200 480 205 L 488 212 Q 492 222 488 232 L 480 238 Q 470 235 464 228 L 458 218 Z' },
  { id: 'dza', nameZh: '阿尔及利亚', path: 'M 470 218 Q 482 210 495 215 L 508 222 Q 518 232 515 245 L 508 252 Q 496 258 485 252 L 472 242 Q 462 230 470 218 Z' },
  { id: 'lby', nameZh: '利比亚', path: 'M 508 222 Q 520 215 535 222 L 548 232 Q 552 245 546 255 L 535 260 Q 522 262 514 252 L 506 242 Z' },
  { id: 'sdn', nameZh: '苏丹', path: 'M 530 248 Q 540 240 555 245 L 568 255 Q 572 268 566 278 L 555 285 Q 542 288 534 278 L 526 265 Z' },
  { id: 'nga', nameZh: '尼日利亚', path: 'M 500 260 Q 510 252 520 258 L 528 268 Q 530 280 525 288 L 515 290 Q 504 285 500 275 Z' },
  { id: 'ken', nameZh: '肯尼亚', path: 'M 545 305 Q 555 298 565 305 L 572 315 Q 574 328 566 335 L 555 338 Q 544 332 542 320 Z' },
  { id: 'eth', nameZh: '埃塞俄比亚', path: 'M 548 280 Q 558 272 568 278 L 578 288 Q 580 302 572 310 L 562 315 Q 550 312 546 300 L 544 288 Z' },
  { id: 'zaf', nameZh: '南非', path: 'M 530 355 Q 540 348 550 355 L 562 365 Q 568 378 560 390 L 548 398 Q 535 395 528 385 L 522 372 Z' },
  { id: 'cod', nameZh: '刚果(金)', path: 'M 525 298 Q 535 290 548 295 L 558 305 Q 562 318 558 330 L 548 338 Q 536 340 528 332 L 520 318 Z' },
  { id: 'tza', nameZh: '坦桑尼亚', path: 'M 548 325 Q 555 318 565 322 L 572 332 Q 574 345 568 352 L 558 355 Q 548 350 545 340 Z' },
  { id: 'ago', nameZh: '安哥拉', path: 'M 515 320 Q 525 312 538 318 L 548 328 Q 550 342 542 350 L 530 352 Q 518 346 512 335 Z' },
  { id: 'nam', nameZh: '纳米比亚', path: 'M 518 352 Q 525 345 535 350 L 542 360 Q 544 372 538 378 L 528 380 Q 518 374 514 362 Z' },
  { id: 'mdg', nameZh: '马达加斯加', path: 'M 578 345 Q 582 340 586 348 L 588 362 Q 585 372 580 375 Q 576 370 574 358 Z' },
  // ── Asia ──
  { id: 'chn', nameZh: '中国', path: 'M 700 120 Q 730 108 765 115 L 800 128 Q 820 140 825 160 L 820 180 Q 810 200 790 210 L 760 218 Q 730 222 705 215 L 680 205 Q 660 190 658 172 L 662 155 Q 670 138 700 120 Z' },
  { id: 'ind', nameZh: '印度', path: 'M 640 195 Q 655 182 675 188 L 695 198 Q 710 212 708 235 L 700 255 Q 688 268 672 272 L 660 265 Q 648 252 642 235 L 638 215 Z' },
  { id: 'jpn', nameZh: '日本', path: 'M 820 148 Q 832 140 840 152 L 845 168 Q 846 185 840 200 L 832 210 Q 826 205 824 192 L 820 175 Q 818 160 820 148 Z' },
  { id: 'kor', nameZh: '韩国', path: 'M 808 148 Q 814 142 820 148 L 824 158 Q 826 170 822 178 L 816 175 Q 810 168 808 158 Z' },
  { id: 'prk', nameZh: '朝鲜', path: 'M 806 142 Q 810 138 816 142 L 820 148 L 814 152 L 808 148 Z' },
  { id: 'tha', nameZh: '泰国', path: 'M 730 240 Q 738 235 748 240 L 758 248 Q 762 260 758 270 L 748 278 Q 738 282 732 275 L 726 262 Z' },
  { id: 'vnm', nameZh: '越南', path: 'M 742 232 Q 748 225 755 230 L 762 240 Q 765 252 760 262 L 754 270 L 748 265 Q 742 252 742 240 Z' },
  { id: 'idn', nameZh: '印尼', path: 'M 750 285 Q 765 275 785 280 L 800 288 Q 810 298 805 308 L 790 315 Q 775 318 760 312 L 748 305 Q 740 296 750 285 Z' },
  { id: 'phl', nameZh: '菲律宾', path: 'M 802 225 Q 810 218 816 228 L 818 242 Q 816 255 812 252 L 806 245 Q 800 235 802 225 Z' },
  { id: 'mys', nameZh: '马来西亚', path: 'M 742 272 Q 750 265 758 272 L 762 282 Q 760 292 752 295 L 744 290 Q 738 282 742 272 Z' },
  { id: 'mmr', nameZh: '缅甸', path: 'M 722 228 Q 730 222 738 228 L 745 238 Q 748 250 742 258 L 734 260 Q 726 255 722 245 Z' },
  { id: 'pak', nameZh: '巴基斯坦', path: 'M 635 188 Q 642 182 650 186 L 658 195 Q 662 208 656 215 L 648 218 Q 638 212 634 202 Z' },
  { id: 'afg', nameZh: '阿富汗', path: 'M 638 158 Q 648 150 660 155 L 670 165 Q 672 178 664 182 L 652 180 Q 642 175 636 165 Z' },
  { id: 'kaz', nameZh: '哈萨克斯坦', path: 'M 630 105 Q 650 95 675 100 L 698 108 Q 710 118 705 128 L 695 132 Q 675 135 658 130 L 642 125 Q 628 115 630 105 Z' },
  { id: 'uzb', nameZh: '乌兹别克斯坦', path: 'M 635 118 Q 645 110 660 115 L 675 125 Q 680 135 672 142 L 658 148 Q 642 145 634 135 Z' },
  { id: 'mng', nameZh: '蒙古', path: 'M 695 88 Q 715 78 740 82 L 760 92 Q 768 102 762 112 L 750 118 Q 730 120 712 115 L 695 108 Q 688 98 695 88 Z' },
  { id: 'npl', nameZh: '尼泊尔', path: 'M 662 188 Q 668 182 674 188 L 676 198 Q 672 205 666 202 L 660 195 Z' },
  { id: 'bgd', nameZh: '孟加拉国', path: 'M 672 208 Q 678 202 684 208 L 688 218 Q 684 228 678 225 L 670 218 Z' },
  { id: 'lka', nameZh: '斯里兰卡', path: 'M 654 262 Q 658 256 662 264 L 660 274 Q 656 276 652 270 Z' },
  { id: 'twn', nameZh: '台湾', path: 'M 804 186 Q 810 182 814 190 L 812 202 Q 808 206 804 198 Z' },
  { id: 'khm', nameZh: '柬埔寨', path: 'M 740 260 Q 746 255 752 262 L 755 272 Q 752 280 746 278 L 740 272 Z' },
  { id: 'lao', nameZh: '老挝', path: 'M 734 240 Q 740 235 748 240 L 752 250 Q 748 258 740 256 Z' },
  // ── Oceania ──
  { id: 'aus', nameZh: '澳大利亚', path: 'M 760 345 Q 790 332 825 340 L 850 350 Q 868 365 860 390 L 842 408 Q 815 415 790 408 L 768 398 Q 752 382 755 365 Z' },
  { id: 'nzl', nameZh: '新西兰', path: 'M 880 395 Q 888 388 892 400 L 890 418 Q 886 425 880 418 L 876 405 Z' },
  { id: 'png', nameZh: '巴布亚新几内亚', path: 'M 800 308 Q 810 300 822 305 L 830 315 Q 828 325 820 328 L 810 325 Q 800 318 800 308 Z' },
  // ── Central America / Caribbean ──
  { id: 'cub', nameZh: '古巴', path: 'M 225 245 Q 240 238 255 245 L 258 252 Q 252 258 240 260 L 228 256 Z' },
  { id: 'pan', nameZh: '巴拿马', path: 'M 242 295 Q 248 290 255 296 L 258 305 Q 254 312 248 310 L 240 305 Z' },
];

// ══════════════════════════════════════════════════════════════
// World cities  (coordinates as percentages within 1000×500)
// ══════════════════════════════════════════════════════════════

interface WorldCity {
  city: string;
  country: string;
  countryId: string;
  top: number;
  left: number;
}

const WORLD_CITIES: WorldCity[] = [
  { city: '北京', country: '中国', countryId: 'chn', top: 23.5, left: 74.0 },
  { city: '上海', country: '中国', countryId: 'chn', top: 27.5, left: 77.0 },
  { city: '成都', country: '中国', countryId: 'chn', top: 26.5, left: 68.5 },
  { city: '广州', country: '中国', countryId: 'chn', top: 30.5, left: 74.5 },
  { city: '深圳', country: '中国', countryId: 'chn', top: 31.5, left: 75.0 },
  { city: '香港', country: '中国', countryId: 'chn', top: 32.0, left: 75.5 },
  { city: '台北', country: '台湾', countryId: 'twn', top: 28.0, left: 80.5 },
  { city: '西安', country: '中国', countryId: 'chn', top: 25.5, left: 70.5 },
  { city: '拉萨', country: '中国', countryId: 'chn', top: 23.8, left: 63.0 },
  { city: '东京', country: '日本', countryId: 'jpn', top: 24.5, left: 83.5 },
  { city: '京都', country: '日本', countryId: 'jpn', top: 25.8, left: 82.8 },
  { city: '大阪', country: '日本', countryId: 'jpn', top: 26.2, left: 83.2 },
  { city: '首尔', country: '韩国', countryId: 'kor', top: 22.0, left: 81.5 },
  { city: '新加坡', country: '新加坡', countryId: 'mys', top: 41.8, left: 76.5 },
  { city: '曼谷', country: '泰国', countryId: 'tha', top: 35.8, left: 74.5 },
  { city: '清迈', country: '泰国', countryId: 'tha', top: 32.0, left: 73.8 },
  { city: '胡志明市', country: '越南', countryId: 'vnm', top: 37.2, left: 76.2 },
  { city: '河内', country: '越南', countryId: 'vnm', top: 32.2, left: 75.0 },
  { city: '吉隆坡', country: '马来西亚', countryId: 'mys', top: 40.5, left: 75.0 },
  { city: '巴厘岛', country: '印尼', countryId: 'idn', top: 46.0, left: 79.0 },
  { city: '马尼拉', country: '菲律宾', countryId: 'phl', top: 33.5, left: 81.0 },
  { city: '新德里', country: '印度', countryId: 'ind', top: 29.5, left: 66.5 },
  { city: '孟买', country: '印度', countryId: 'ind', top: 32.5, left: 64.8 },
  { city: '迪拜', country: '阿联酋', countryId: 'are', top: 31.0, left: 59.8 },
  { city: '伊斯坦布尔', country: '土耳其', countryId: 'tur', top: 22.5, left: 55.0 },
  { city: '德黑兰', country: '伊朗', countryId: 'irn', top: 24.0, left: 57.5 },
  { city: '伦敦', country: '英国', countryId: 'gbr', top: 16.5, left: 45.2 },
  { city: '巴黎', country: '法国', countryId: 'fra', top: 18.2, left: 47.0 },
  { city: '罗马', country: '意大利', countryId: 'ita', top: 21.0, left: 49.2 },
  { city: '巴塞罗那', country: '西班牙', countryId: 'esp', top: 21.5, left: 45.2 },
  { city: '柏林', country: '德国', countryId: 'deu', top: 15.5, left: 49.8 },
  { city: '阿姆斯特丹', country: '荷兰', countryId: 'nld', top: 15.0, left: 48.0 },
  { city: '布拉格', country: '捷克', countryId: 'cze', top: 17.0, left: 50.0 },
  { city: '维也纳', country: '奥地利', countryId: 'aut', top: 18.0, left: 50.2 },
  { city: '莫斯科', country: '俄罗斯', countryId: 'rus', top: 11.0, left: 58.0 },
  { city: '圣彼得堡', country: '俄罗斯', countryId: 'rus', top: 8.0, left: 56.0 },
  { city: '雷克雅未克', country: '冰岛', countryId: 'isl', top: 7.5, left: 40.5 },
  { city: '斯德哥尔摩', country: '瑞典', countryId: 'swe', top: 11.0, left: 51.0 },
  { city: '雅典', country: '希腊', countryId: 'grc', top: 23.5, left: 54.0 },
  { city: '开罗', country: '埃及', countryId: 'egy', top: 28.0, left: 55.5 },
  { city: '开普敦', country: '南非', countryId: 'zaf', top: 63.0, left: 54.0 },
  { city: '内罗毕', country: '肯尼亚', countryId: 'ken', top: 45.5, left: 56.0 },
  { city: '马拉喀什', country: '摩洛哥', countryId: 'mar', top: 26.5, left: 46.8 },
  { city: '纽约', country: '美国', countryId: 'usa', top: 22.0, left: 24.0 },
  { city: '洛杉矶', country: '美国', countryId: 'usa', top: 26.5, left: 14.5 },
  { city: '旧金山', country: '美国', countryId: 'usa', top: 23.5, left: 12.0 },
  { city: '芝加哥', country: '美国', countryId: 'usa', top: 21.0, left: 21.5 },
  { city: '温哥华', country: '加拿大', countryId: 'can', top: 13.5, left: 11.0 },
  { city: '多伦多', country: '加拿大', countryId: 'can', top: 18.5, left: 26.0 },
  { city: '墨西哥城', country: '墨西哥', countryId: 'mex', top: 32.0, left: 20.0 },
  { city: '里约热内卢', country: '巴西', countryId: 'bra', top: 53.0, left: 32.5 },
  { city: '布宜诺斯艾利斯', country: '阿根廷', countryId: 'arg', top: 62.5, left: 30.0 },
  { city: '圣地亚哥', country: '智利', countryId: 'chl', top: 60.0, left: 25.8 },
  { city: '利马', country: '秘鲁', countryId: 'per', top: 48.0, left: 25.5 },
  { city: '悉尼', country: '澳大利亚', countryId: 'aus', top: 61.0, left: 83.5 },
  { city: '墨尔本', country: '澳大利亚', countryId: 'aus', top: 64.0, left: 82.0 },
  { city: '奥克兰', country: '新西兰', countryId: 'nzl', top: 66.0, left: 88.5 },
];

// ══════════════════════════════════════════════════════════════
// Travel tips
// ══════════════════════════════════════════════════════════════
const TRAVEL_TIPS = [
  { icon: '🎒', title: '轻装出行', tip: '随身带一个可压缩收纳袋，脏衣服和干净衣服分开，省空间又卫生。' },
  { icon: '📱', title: '离线地图', tip: '出发前下载好Google Maps离线地图，没有网络也能导航不迷路。' },
  { icon: '💰', title: '省钱秘籍', tip: '用当地超市买早餐，比酒店早餐便宜5-10倍，还能体验当地人生活。' },
  { icon: '📷', title: '拍照技巧', tip: '黄金时段（日出后1小时/日落前1小时）拍照光线最柔美，避开正午强光。' },
  { icon: '🏨', title: '住宿选择', tip: '民宿比酒店更能体验当地文化，但看评价时重点关注"卫生"和"位置"两项。' },
  { icon: '🛂', title: '证件安全', tip: '护照拍照存手机+云盘，纸质复印件放不同行李箱。丢了不慌。' },
  { icon: '🍜', title: '美食发现', tip: '不要只看TripAdvisor——去当地菜市场和小巷子里找排队最多的店，那才是真好吃。' },
  { icon: '🚆', title: '交通攻略', tip: '欧洲买Eurail通票，日本买JR Pass，东南亚坐夜班巴士——省钱又省住宿。' },
  { icon: '🌞', title: '防晒必备', tip: '阴天也要涂防晒！紫外线穿云能力很强，高原和海边尤其需要注意。' },
  { icon: '🗣️', title: '语言沟通', tip: '学5句当地语言（你好/谢谢/多少钱/在哪/好吃）能打开90%的善意。' },
  { icon: '⏰', title: '时差调节', tip: '到达后立刻按当地时间作息，白天多晒太阳，帮助身体快速调整生物钟。' },
  { icon: '🧳', title: '打包技巧', tip: '卷衣服比叠衣服省空间30%，重物放箱底靠近轮子，易碎品用袜子包裹。' },
  { icon: '🚨', title: '安全提醒', tip: '贵重物品分开放——护照、现金、银行卡不要放在同一个包里。' },
  { icon: '🌿', title: '环保旅行', tip: '自带水壶和购物袋，减少一次性塑料。选择步行和骑行探索城市。' },
];

// ══════════════════════════════════════════════════════════════
// City Popup Card
// ══════════════════════════════════════════════════════════════
function CityPopupCard({
  city, isVisited, existingData, mode,
  onSave, onUpdate, onDelete, onClose, onToggleMode,
}: {
  city: WorldCity;
  isVisited: boolean;
  existingData: { visitDate: string | null; feeling: string | null; id?: string };
  mode: 'explore' | 'footprint';
  onSave: (d: string, f: string) => Promise<void>;
  onUpdate: (d: string, f: string) => Promise<void>;
  onDelete: () => void;
  onClose: () => void;
  onToggleMode: () => void;
}) {
  const [visitDate, setVisitDate] = useState(existingData.visitDate || '');
  const [feeling, setFeeling] = useState(existingData.feeling || '');
  const [editing, setEditing] = useState(!isVisited && mode === 'footprint');
  const [saving, setSaving] = useState(false);

  const doSave = async () => {
    if (!visitDate) { toast.error('请选择到访日期'); return; }
    setSaving(true);
    try { isVisited && existingData.id ? await onUpdate(visitDate, feeling) : await onSave(visitDate, feeling); setEditing(false); }
    finally { setSaving(false); }
  };

  return (
    <motion.div
      className="absolute top-4 right-4 w-80 p-5 rounded-2xl z-30"
      style={{ background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(24px)', border: '1px solid rgba(0,0,0,0.04)', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.03)' }}
      initial={{ opacity: 0, scale: 0.88, y: -12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.88, y: -12 }}
      transition={{ type: 'spring', stiffness: 450, damping: 28 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #f59e0b, #f97316)', boxShadow: '0 4px 12px rgba(245,158,11,0.3)' }}>
            <MapPin className="h-5 w-5 text-white" />
          </div>
          <div><h4 className="text-sm font-bold text-slate-800">{city.city}</h4><p className="text-[10px] text-slate-500">{city.country}</p></div>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-slate-100"><X className="h-4 w-4 text-slate-400" /></button>
      </div>

      {mode === 'explore' && !isVisited ? (
        <div className="text-center py-5">
          <motion.div className="text-4xl mb-3" animate={{ rotate: [0, -4, 4, 0] }} transition={{ duration: 3, repeat: Infinity }}>🔭</motion.div>
          <p className="text-sm font-medium text-slate-600 mb-1">你还没有去过{city.city}</p>
          <p className="text-xs text-slate-400 mb-4">切换到"足迹模式"来标记旅行记忆 ✈️</p>
          <button onClick={onToggleMode} className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold text-white transition-all hover:scale-105" style={{ background: 'linear-gradient(135deg, #10b981, #059669)', boxShadow: '0 4px 12px rgba(16,185,129,0.3)' }}>
            <Footprints className="h-3.5 w-3.5" />开启足迹模式
          </button>
        </div>
      ) : mode === 'footprint' && isVisited && !editing ? (
        <div className="space-y-3">
          <div className="p-3.5 rounded-xl" style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.12)' }}>
            <p className="text-[10px] font-bold text-emerald-600 mb-1.5">📅 到访日期</p>
            <p className="text-sm font-medium text-slate-800 ml-6">{existingData.visitDate || '未记录'}</p>
          </div>
          <div className="p-3.5 rounded-xl" style={{ background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.12)' }}>
            <p className="text-[10px] font-bold text-amber-600 mb-1.5">💭 当时感受</p>
            <p className="text-sm leading-relaxed ml-6 italic text-slate-600">{existingData.feeling || '未记录'}</p>
          </div>
          <div className="flex gap-2 pt-1">
            <button onClick={() => setEditing(true)} className="flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5" style={{ background: 'rgba(16,185,129,0.08)', color: '#059669', border: '1px solid rgba(16,185,129,0.2)' }}><Edit3 className="h-3 w-3" />编辑</button>
            <button onClick={onDelete} className="py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5" style={{ background: 'rgba(239,68,68,0.05)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.15)' }}><Trash2 className="h-3 w-3" />删除</button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div><label className="text-[10px] font-bold text-slate-500 mb-1.5 block">📅 到访日期</label><input type="date" value={visitDate} onChange={e => setVisitDate(e.target.value)} className="w-full px-3 py-2.5 rounded-xl text-sm border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-emerald-400" /></div>
          <div><label className="text-[10px] font-bold text-slate-500 mb-1.5 block">💭 一句话感受</label><input type="text" value={feeling} onChange={e => setFeeling(e.target.value)} placeholder="那一刻，我心里在想……" maxLength={100} className="w-full px-3 py-2.5 rounded-xl text-sm border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-emerald-400" /></div>
          <div className="flex gap-2 pt-1">
            <button onClick={doSave} disabled={saving || !visitDate} className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white transition-all hover:scale-[1.02] disabled:opacity-40" style={{ background: 'linear-gradient(135deg, #10b981, #059669)', boxShadow: '0 4px 12px rgba(16,185,129,0.25)' }}>{saving ? '保存中...' : isVisited ? '💾 更新足迹' : '📍 标记足迹'}</button>
            {isVisited && <button onClick={() => setEditing(false)} className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-500">取消</button>}
          </div>
        </div>
      )}
    </motion.div>
  );
}

// ══════════════════════════════════════════════════════════════
// Main Page
// ══════════════════════════════════════════════════════════════
export default function TravelPage() {
  const { cities, visitedCities, showVisited, dailyRecommendation, countryKnowledge, isLoading, setShowVisited, toggleCity, updateCityVisit } = useTravel();
  const [selectedCity, setSelectedCity] = useState<WorldCity | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);

  // Pan & zoom
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const minZ = 0.6, maxZ = 3.5;

  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const rect = containerRef.current?.getBoundingClientRect(); if (!rect) return;
    const mx = e.clientX - rect.left, my = e.clientY - rect.top;
    const dz = e.deltaY > 0 ? -0.08 : 0.08;
    const nz = Math.min(maxZ, Math.max(minZ, zoom + dz));
    const sc = nz / zoom;
    setPan(p => ({ x: mx - sc * (mx - p.x), y: my - sc * (my - p.y) }));
    setZoom(nz);
  }, [zoom]);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 0) { setDragging(true); setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y }); }
  }, [pan]);
  const onMouseMove = useCallback((e: React.MouseEvent) => { if (dragging) setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y }); }, [dragging, dragStart]);
  const onMouseUp = useCallback(() => setDragging(false), []);

  const visitedSet = useMemo(() => new Set(visitedCities.map(c => `${c.city}-${c.country}`)), [visitedCities]);
  const visitedCountryIds = useMemo(() => {
    const ids = new Set<string>();
    visitedCities.forEach(vc => { const m = WORLD_CITIES.find(w => w.city === vc.city && w.country === vc.country); if (m) ids.add(m.countryId); });
    return ids;
  }, [visitedCities]);

  const handleSave = async (d: string, f: string) => {
    if (!selectedCity) return;
    await toggleCity({ city: selectedCity.city, country: selectedCity.country, lat: selectedCity.top, lng: selectedCity.left }, d, f);
    toast.success(`${selectedCity.city} 已标记！🗺️`); setShowPopup(false); setSelectedCity(null);
  };
  const handleUpdate = async (d: string, f: string) => {
    if (!selectedCity) return;
    const ex = cities.find(c => c.city === selectedCity.city && c.country === selectedCity.country);
    if (ex?.id) { await updateCityVisit(ex.id, d, f); toast.success('足迹已更新 ✨'); }
  };
  const handleDelete = async () => {
    if (!selectedCity) return;
    await toggleCity({ city: selectedCity.city, country: selectedCity.country, lat: selectedCity.top, lng: selectedCity.left });
    toast.success('足迹已删除'); setShowPopup(false); setSelectedCity(null);
  };

  const dayIdx = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  const todayTip = TRAVEL_TIPS[dayIdx % TRAVEL_TIPS.length]!;
  const showLabels = zoom >= 1.5;

  if (isLoading) return <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20"><LoadingSpinner size="lg" text="加载中..." /></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2 text-emerald-600"><Map className="h-7 w-7" />旅行探索</h1>
        <p className="text-sm mt-1 text-slate-400">探索世界 · 记录足迹 · 增长见识</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* ── Map ── */}
          <div className="module-card overflow-hidden" style={{ '--module-accent': '#10b981' } as React.CSSProperties}>
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <h2 className="section-title mb-0" style={{ '--module-accent': '#10b981' } as React.CSSProperties}>
                <Globe className="h-5 w-5 text-emerald-500" />{showVisited ? '足迹点亮 · 世界航海图' : '白纸探索 · 世界航海图'}
              </h2>
              <div className="flex items-center gap-2">
                <button onClick={() => setShowVisited(!showVisited)}
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all duration-300"
                  style={{ background: showVisited ? 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(5,150,105,0.06))' : 'var(--color-surface-alt)', color: showVisited ? '#059669' : 'var(--color-text-muted)', border: showVisited ? '1.5px solid rgba(16,185,129,0.35)' : '1.5px solid var(--color-border)' }}>
                  {showVisited ? <><Footprints className="h-4 w-4" />足迹点亮模式</> : <><Telescope className="h-4 w-4" />白纸探索模式</>}
                </button>
                <div className="flex items-center gap-1 p-1 rounded-full bg-white/60 border border-slate-200">
                  <button onClick={() => setZoom(z => Math.min(maxZ, z + 0.2))} className="p-1.5 rounded-full hover:bg-white"><ZoomIn className="h-3.5 w-3.5 text-slate-500" /></button>
                  <button onClick={() => setZoom(z => Math.max(minZ, z - 0.2))} className="p-1.5 rounded-full hover:bg-white"><ZoomOut className="h-3.5 w-3.5 text-slate-500" /></button>
                  <button onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }} className="p-1.5 rounded-full hover:bg-white"><RotateCcw className="h-3.5 w-3.5 text-slate-500" /></button>
                </div>
              </div>
            </div>

            {/* Map canvas */}
            <div ref={containerRef}
              className="relative rounded-2xl overflow-hidden select-none"
              style={{ height: 480, cursor: dragging ? 'grabbing' : 'grab', background: '#E8F1F5' }}
              onWheel={onWheel} onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}
            >
              <div className="absolute inset-0 transition-transform duration-75"
                style={{ transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`, transformOrigin: 'center center' }}>
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1000 500" preserveAspectRatio="xMidYMid meet">
                  <defs>
                    <filter id="landShadow" x="-2%" y="-2%" width="104%" height="104%">
                      <feDropShadow dx="0" dy="0.5" stdDeviation="1.5" floodColor="rgba(0,0,0,0.06)" />
                    </filter>
                    <filter id="visitedGlow" x="-10%" y="-10%" width="120%" height="120%">
                      <feGaussianBlur stdDeviation="3" result="blur" />
                      <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                    </filter>
                    <filter id="pinShadow" x="-30%" y="-30%" width="160%" height="160%">
                      <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="rgba(0,0,0,0.15)" />
                    </filter>
                    <radialGradient id="oceanGrad" cx="50%" cy="50%" r="60%">
                      <stop offset="0%" stopColor="#E8F1F5" stopOpacity="0.5" />
                      <stop offset="100%" stopColor="#D6E4EB" stopOpacity="0.3" />
                    </radialGradient>
                    {/* Warm gradient for visited countries */}
                    <linearGradient id="visitedGreen" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#A8E6CF" />
                      <stop offset="50%" stopColor="#7DD3A8" />
                      <stop offset="100%" stopColor="#6BCB9A" />
                    </linearGradient>
                    <linearGradient id="visitedPeach" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#FFD3B6" />
                      <stop offset="50%" stopColor="#FFC3A0" />
                      <stop offset="100%" stopColor="#FFB08C" />
                    </linearGradient>
                  </defs>

                  {/* Ocean base */}
                  <rect x="0" y="0" width="1000" height="500" fill="#E8F1F5" />
                  <rect x="0" y="0" width="1000" height="500" fill="url(#oceanGrad)" />

                  {/* Lat/Lon grid */}
                  {[0, 50, 100, 150, 200, 250, 300, 350, 400, 450, 500].map(y => (
                    <line key={`h${y}`} x1="0" y1={y} x2="1000" y2={y} stroke="rgba(180,195,205,0.2)" strokeWidth="0.8" strokeDasharray="3 10" />
                  ))}
                  {[0, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000].map(x => (
                    <line key={`v${x}`} x1={x} y1="0" x2={x} y2="500" stroke="rgba(180,195,205,0.15)" strokeWidth="0.8" strokeDasharray="3 10" />
                  ))}
                  {/* Equator */}
                  <line x1="0" y1="250" x2="1000" y2="250" stroke="rgba(180,195,205,0.3)" strokeWidth="1.2" strokeDasharray="2 8" />

                  {/* ── Countries ── */}
                  {COUNTRIES.map(c => {
                    const isV = showVisited && visitedCountryIds.has(c.id);
                    const isH = hoveredCountry === c.id;
                    // Alternate between green and peach for visited countries
                    const useGreen = c.id.charCodeAt(0) % 2 === 0;
                    return (
                      <g key={c.id}
                        onMouseEnter={() => { if (!showVisited) setHoveredCountry(c.id); }}
                        onMouseLeave={() => setHoveredCountry(null)}
                        style={{ cursor: showVisited && isV ? 'pointer' : 'default' }}>
                        {/* Country fill */}
                        <path d={c.path}
                          fill={showVisited
                            ? (isV ? `url(#${useGreen ? 'visitedGreen' : 'visitedPeach'})` : '#F4F1EA')
                            : (isH ? '#E8E3D8' : '#F4F1EA')
                          }
                          stroke={showVisited && isV ? 'rgba(100,180,140,0.5)' : 'rgba(190,180,165,0.4)'}
                          strokeWidth={showVisited && isV ? 1 : 0.6}
                          filter={showVisited && isV ? 'url(#visitedGlow)' : 'url(#landShadow)'}
                          style={{ transition: 'fill 0.6s ease, stroke 0.6s ease' }}
                        />
                        {/* Visited country subtle inner highlight */}
                        {showVisited && isV && (
                          <path d={c.path} fill="white" opacity="0.15" style={{ transition: 'opacity 0.4s' }} />
                        )}
                      </g>
                    );
                  })}

                  {/* ── City Pins ── */}
                  {WORLD_CITIES.map(wc => {
                    const isV = visitedSet.has(`${wc.city}-${wc.country}`);
                    const isSel = selectedCity?.city === wc.city && selectedCity?.country === wc.country;
                    const cx = wc.left * 10, cy = wc.top * 10;
                    if (showVisited && !isV) return null;

                    return (
                      <g key={`${wc.city}-${wc.country}`}
                        onClick={(e) => { e.stopPropagation(); setSelectedCity(wc); setShowPopup(true); }}
                        style={{ cursor: 'pointer' }}>
                        {/* Glow ring for visited */}
                        {showVisited && isV && (
                          <circle cx={cx} cy={cy} r="13" fill="rgba(255,180,130,0.12)">
                            <animate attributeName="r" from="11" to="17" dur="2.2s" repeatCount="indefinite" />
                            <animate attributeName="opacity" from="0.18" to="0.03" dur="2.2s" repeatCount="indefinite" />
                          </circle>
                        )}
                        {/* Pin */}
                        {showVisited ? (
                          <g filter="url(#pinShadow)">
                            <path d={`M ${cx - 4.5} ${cy - 7} Q ${cx} ${cy - 14} ${cx + 4.5} ${cy - 7} L ${cx + 6} ${cy + 3} Q ${cx + 3} ${cy + 9} ${cx} ${cy + 10} Q ${cx - 3} ${cy + 9} ${cx - 6} ${cy + 3} Z`}
                              fill={isV ? '#f87171' : '#fbbf24'} stroke="white" strokeWidth="1.3" />
                            <circle cx={cx - 1.5} cy={cy - 4} r="1.8" fill="rgba(255,255,255,0.7)" />
                            <circle cx={cx} cy={cy + 1.5} r="2.5" fill="white" opacity="0.85" />
                          </g>
                        ) : (
                          <g>
                            <circle cx={cx} cy={cy} r="5" fill="rgba(255,255,255,0.75)" stroke="rgba(180,170,155,0.5)" strokeWidth="1.2" />
                            <circle cx={cx} cy={cy} r="2.2" fill="rgba(140,130,115,0.5)" />
                          </g>
                        )}
                        {/* Selection pulse */}
                        {isSel && (
                          <circle cx={cx} cy={cy} r="8" fill="none" stroke={showVisited ? '#ef4444' : '#f59e0b'} strokeWidth="1.5" opacity="0.55">
                            <animate attributeName="r" from="8" to="20" dur="1.3s" repeatCount="indefinite" />
                            <animate attributeName="opacity" from="0.55" to="0" dur="1.3s" repeatCount="indefinite" />
                          </circle>
                        )}
                        {/* Label when zoomed in */}
                        {showLabels && (
                          <g>
                            <rect x={cx - 18} y={cy + 12} width="36" height="14" rx="3.5"
                              fill="rgba(255,255,255,0.92)" stroke="rgba(0,0,0,0.06)" strokeWidth="0.5" />
                            <text x={cx} y={cy + 22} textAnchor="middle" fill="#334155" fontSize="7.5" fontWeight="600" fontFamily="system-ui, sans-serif">
                              {wc.city}
                            </text>
                          </g>
                        )}
                      </g>
                    );
                  })}

                  {/* ── Compass rose ── */}
                  <g transform="translate(935, 65)">
                    <circle cx="0" cy="0" r="20" fill="none" stroke="rgba(170,185,195,0.3)" strokeWidth="1" />
                    <line x1="0" y1="-18" x2="0" y2="18" stroke="rgba(170,185,195,0.3)" strokeWidth="1" />
                    <line x1="-18" y1="0" x2="18" y2="0" stroke="rgba(170,185,195,0.3)" strokeWidth="1" />
                    <polygon points="0,-16 -3.5,-3.5 0,-7 3.5,-3.5" fill="rgba(170,185,195,0.35)" />
                    <polygon points="0,16 -3.5,3.5 0,7 3.5,3.5" fill="rgba(170,185,195,0.12)" />
                    <text x="0" y="-22" textAnchor="middle" fill="rgba(170,185,195,0.45)" fontSize="7" fontWeight="bold">N</text>
                  </g>
                </svg>
              </div>

              {/* Legend */}
              <div className="absolute bottom-4 left-4 flex items-center gap-4 text-[10px] px-4 py-2.5 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(12px)', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                {showVisited ? (
                  <><span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-red-400" /> 已点亮足迹</span><span className="text-slate-500">{visitedCities.length} 个目的地</span></>
                ) : (
                  <><span className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-amber-300/60" /> 待探索</span><span className="text-slate-500">{WORLD_CITIES.length} 个可选城市</span></>
                )}
              </div>

              {/* Zoom indicator */}
              <div className="absolute bottom-4 right-4 text-[10px] px-2.5 py-1 rounded-full bg-white/70 backdrop-blur text-slate-500 shadow-sm">
                {Math.round(zoom * 100)}%{showLabels && <span className="ml-1 text-emerald-500">· 城市</span>}
              </div>

              {/* Popup */}
              <AnimatePresence>
                {showPopup && selectedCity && (
                  <CityPopupCard city={selectedCity}
                    isVisited={visitedSet.has(`${selectedCity.city}-${selectedCity.country}`)}
                    existingData={(() => { const e = cities.find(c => c.city === selectedCity.city && c.country === selectedCity.country); return { visitDate: e?.visitDate || null, feeling: e?.feeling || null, id: e?.id }; })()}
                    mode={showVisited ? 'footprint' : 'explore'}
                    onSave={handleSave} onUpdate={handleUpdate} onDelete={handleDelete}
                    onClose={() => { setShowPopup(false); setSelectedCity(null); }}
                    onToggleMode={() => setShowVisited(true)} />
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* ── Country Knowledge ── */}
          {countryKnowledge && (
            <div className="module-card" style={{ '--module-accent': '#3b82f6' } as React.CSSProperties}>
              <h2 className="section-title" style={{ '--module-accent': '#3b82f6' } as React.CSSProperties}>
                <Globe className="h-5 w-5 text-blue-500" />今日国家地理：{countryKnowledge.flag} {countryKnowledge.country}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-surface-alt"><p className="text-xs font-bold mb-2 text-blue-500">📖 历史人文</p><p className="text-sm leading-relaxed text-slate-600">{countryKnowledge.history}</p></div>
                  <div className="p-4 rounded-xl bg-surface-alt"><p className="text-xs font-bold mb-2 text-blue-500">🎭 文化特色</p><p className="text-sm leading-relaxed text-slate-600">{countryKnowledge.culture}</p></div>
                </div>
                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-surface-alt"><p className="text-xs font-bold mb-2 text-blue-500">🗺️ 地理</p><p className="text-sm leading-relaxed text-slate-600">{countryKnowledge.geography}</p></div>
                  <div className="p-4 rounded-xl bg-surface-alt"><p className="text-xs font-bold mb-2 text-amber-500">🎯 冷知识</p><ul className="space-y-2">{countryKnowledge.funFacts.map((f, i) => (<li key={i} className="flex items-start gap-2"><Sparkles className="h-3.5 w-3.5 flex-shrink-0 mt-0.5 text-amber-400" /><span className="text-xs leading-relaxed text-slate-600">{f}</span></li>))}</ul></div>
                  <div className="flex items-center gap-4 text-xs p-3 rounded-xl bg-blue-50"><span>🏙️ 首都：{countryKnowledge.capital}</span><span>👥 人口：{countryKnowledge.population}</span></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Sidebar ── */}
        <div className="space-y-6">
          {dailyRecommendation && (
            <div className="module-card" style={{ '--module-accent': '#f59e0b' } as React.CSSProperties}>
              <h2 className="section-title" style={{ '--module-accent': '#f59e0b' } as React.CSSProperties}><Plane className="h-5 w-5 text-amber-500" />每日旅行推荐</h2>
              <div className="p-4 rounded-xl" style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.07), rgba(249,115,22,0.05))', border: '1px solid rgba(245,158,11,0.18)' }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-12 w-12 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #f59e0b, #f97316)' }}><Plane className="h-6 w-6 text-white" /></div>
                  <div><h3 className="text-lg font-bold text-amber-700">{dailyRecommendation.destination}</h3><p className="text-xs text-amber-800">{dailyRecommendation.country} · {dailyRecommendation.days}日游</p></div>
                </div>
                <div className="space-y-2.5">
                  <div className="p-3 rounded-lg bg-surface"><div className="flex items-center gap-1.5 mb-1.5"><Navigation className="h-3.5 w-3.5 text-orange-500" /><span className="text-xs font-bold text-orange-500">路线</span></div><p className="text-xs leading-relaxed text-slate-600">{dailyRecommendation.route}</p></div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-3 rounded-lg bg-surface"><div className="flex items-center gap-1.5 mb-1.5"><Landmark className="h-3.5 w-3.5 text-indigo-500" /><span className="text-xs font-bold text-indigo-500">景点</span></div>{dailyRecommendation.attractions.slice(0, 4).map((a, i) => (<p key={i} className="text-[10px] leading-relaxed text-slate-600">• {a}</p>))}</div>
                    <div className="p-3 rounded-lg bg-surface"><div className="flex items-center gap-1.5 mb-1.5"><UtensilsCrossed className="h-3.5 w-3.5 text-red-500" /><span className="text-xs font-bold text-red-500">美食</span></div>{dailyRecommendation.food.map((f, i) => (<p key={i} className="text-[10px] leading-relaxed text-slate-600">• {f}</p>))}</div>
                  </div>
                  <div className="p-3 rounded-lg bg-surface"><div className="flex items-center gap-1.5 mb-1.5"><Trees className="h-3.5 w-3.5 text-emerald-500" /><span className="text-xs font-bold text-emerald-500">风光</span></div><p className="text-xs leading-relaxed text-slate-600">{dailyRecommendation.scenery}</p></div>
                </div>
              </div>
            </div>
          )}
          <div className="module-card" style={{ '--module-accent': '#06b6d4' } as React.CSSProperties}>
            <h2 className="section-title" style={{ '--module-accent': '#06b6d4' } as React.CSSProperties}><Compass className="h-5 w-5 text-cyan-500" />今日旅行小贴士</h2>
            <div className="p-4 rounded-xl" style={{ background: 'rgba(6,182,212,0.05)', border: '1px solid rgba(6,182,212,0.12)' }}>
              <div className="flex items-center gap-3 mb-2"><span className="text-3xl">{todayTip.icon}</span><h3 className="text-base font-bold text-cyan-700">{todayTip.title}</h3></div>
              <p className="text-sm leading-relaxed text-slate-600">{todayTip.tip}</p>
            </div>
          </div>
          {visitedCities.length > 0 && (
            <div className="module-card" style={{ '--module-accent': '#ef4444' } as React.CSSProperties}>
              <h2 className="section-title" style={{ '--module-accent': '#ef4444' } as React.CSSProperties}><MapPin className="h-5 w-5 text-red-500" />我的足迹 ({visitedCities.length})</h2>
              <div className="space-y-1.5 max-h-[250px] overflow-y-auto scrollbar-hide">
                {visitedCities.map(city => (
                  <div key={city.id} className="flex items-start gap-2.5 p-3 rounded-xl bg-surface-alt">
                    <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5 text-red-400" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2"><span className="text-sm font-bold text-slate-800">{city.city}</span><span className="text-[10px] text-slate-400">{city.country}</span></div>
                      {city.visitDate && <span className="text-[10px] text-slate-400">📅 {city.visitDate}</span>}
                      {city.feeling && <p className="text-xs mt-1 italic text-slate-500">"{city.feeling}"</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
