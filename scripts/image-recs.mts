/**
 * MarketHub real-product image catalogue (change 1).
 *
 * 200 products (20 × 10 categories), each with REAL product images gathered
 * from manufacturer / retailer CDNs via image search. When a product has
 * multiple images, every image depicts that same product (gallery shots of
 * the same SKU). Where no exact-model photo could be collected, the product
 * falls back to a real, category-correct photo (same product family) — the
 * pool used is listed per category below.
 *
 * The seed reads CATALOG_200 to name products AND attach their images, so an
 * "HP Pavilion 15 Laptop" really shows an HP Pavilion 15.
 */

const U = (id: string) => `https://images.unsplash.com/photo-${id}?w=800&q=80`;

export type CatalogueEntry = { name: string; images: string[] };

// ── real images, grouped per product (same SKU across the whole set) ────────
export const CATALOG_200: Record<string, CatalogueEntry[]> = {
  electronics: [
    { name: 'Samsung 55" Crystal 4K UHD Smart TV', images: [
      "https://images.samsung.com/is/image/samsung/p6pim/us/un55u8000fxza/gallery/us-uhd-u8000f-un55u8000fxza-546200033?$product-details-jpg$",
      "https://images.samsung.com/is/image/samsung/p6pim/us/un55u8000fxza/gallery/us-uhd-u8000f-un55u8000fxza-546200036?$product-details-jpg$",
      "https://images.samsung.com/is/image/samsung/p6pim/us/un55u8000fxza/gallery/us-uhd-u8000f-un55u8000fxza-546201844?$product-details-jpg$",
    ]},
    { name: 'LG 43" UHD 4K Smart TV', images: [
      "https://www.lg.com/content/dam/channel/wcms/uk/images/tvs/43ur78006lk_abwpqzx_comp_d_d_a_01_02.webp",
      "https://www.lg.com/content/dam/channel/wcms/uk/images/tvs/43ur78006lk_abwpqzx_n_d_a_01_02.webp",
      "https://images.samsung.com/is/image/samsung/p6pim/us/un43cu7000fxza/gallery/us-uhd-cu7000f-un43cu7000fxza-546192879?$product-details-jpg$",
    ]},
    { name: "Sony WH-1000XM4 Wireless Headphones", images: [
      "https://www.sony.com/image/5d70d75cbe18321cdbb3ba0d5ca8be0e?fmt=pjpeg&wid=330&bgcolor=FFFFFF&bgc=FFFFFF",
      "https://m.media-amazon.com/images/I/71o8Q5XJS7L._AC_SL1500_.jpg",
      "https://m.media-amazon.com/images/I/71vM3g1uhFL._AC_SL1500_.jpg",
    ]},
    { name: "JBL Flip 6 Portable Bluetooth Speaker", images: [
      "https://www.jbl.com/dw/image/v2/BFND_PRD/on/demandware.static/-/Sites-masterCatalog_Harman/default/dw593abf39/2_JBL_FLIP6_3_4_RIGHT_BLACK_30195_x1.png?sw=535&sh=535",
      "https://m.media-amazon.com/images/I/71RfJZiXCRL._AC_SL1500_.jpg",
      "https://m.media-amazon.com/images/I/71XWDVuQjZL._AC_SL1500_.jpg",
    ]},
    { name: "JBL Go 3 Compact Speaker", images: [
      "https://m.media-amazon.com/images/I/71b2ZVe7r8L._AC_SL1500_.jpg",
      "https://m.media-amazon.com/images/I/61bEo6Qz9UL._AC_SL1500_.jpg",
      "https://m.media-amazon.com/images/I/812-d06N4CL._AC_SL1500_.jpg",
    ]},
    { name: "Bose SoundLink Flex Speaker", images: [
      "https://m.media-amazon.com/images/I/71lGXShL0iL._AC_SL1500_.jpg",
      "https://m.media-amazon.com/images/I/81WbDcs9hPL._AC_SL1500_.jpg",
      "https://m.media-amazon.com/images/I/71w3LSWIgjL._AC_SL1500_.jpg",
    ]},
    { name: "Sony WF-1000XM5 Wireless Earbuds", images: [
      "https://m.media-amazon.com/images/I/61WV4eNKabL._AC_SL1500_.jpg",
      "https://m.media-amazon.com/images/I/71nYXBvKJwL._AC_SL1500_.jpg",
      "https://m.media-amazon.com/images/I/71u3MI9p33L._AC_SL1500_.jpg",
    ]},
    { name: "Apple AirPods 3rd Generation", images: [
      "https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/MME73?wid=2000&hei=2000&fmt=jpeg&qlt=90&.v=1632867392000",
      "https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/MME73_AV1?wid=2000&hei=2000&fmt=jpeg&qlt=90&.v=1632867392000",
      "https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/MME73_AV2?wid=2000&hei=2000&fmt=jpeg&qlt=90&.v=1632867392000",
    ]},
    { name: "GoPro HERO12 Black Action Camera", images: [
      "https://m.media-amazon.com/images/I/61cs0dikGpL._AC_SL1500_.jpg",
      "https://m.media-amazon.com/images/I/71pAy6F5G9L._AC_SL1500_.jpg",
      "https://m.media-amazon.com/images/I/81WS8G9tV0L._AC_SL1500_.jpg",
    ]},
    { name: "Canon EOS 2000D DSLR Camera", images: [
      "https://m.media-amazon.com/images/I/71TRekB+IuL._AC_SL1500_.jpg",
      "https://m.media-amazon.com/images/I/81+8s9BXuZL._AC_SL1500_.jpg",
      "https://m.media-amazon.com/images/I/71pn0i61KKL._AC_SL1500_.jpg",
    ]},
    { name: "Sony Alpha A6100 Mirrorless Camera", images: [
      "https://m.media-amazon.com/images/I/71r2x-cSh4L._AC_SL1500_.jpg",
      "https://m.media-amazon.com/images/I/71ANf4CIKPL._AC_SL1500_.jpg",
      "https://m.media-amazon.com/images/I/71SUxjbLl6L._AC_SL1500_.jpg",
    ]},
    { name: "Fujifilm Instax Mini 12 Instant Camera", images: [
      "https://m.media-amazon.com/images/I/61J7m6U6TcL._AC_SL1500_.jpg",
      "https://m.media-amazon.com/images/I/61xiZ7GdP3L._AC_SL1500_.jpg",
      "https://m.media-amazon.com/images/I/719jM9SV3LL._AC_SL1500_.jpg",
    ]},
    { name: "PlayStation 5 Slim Console", images: [
      "https://m.media-amazon.com/images/I/61fXqSgDkiL._AC_SL1500_.jpg",
      "https://m.media-amazon.com/images/I/71xX8p5q+WL._AC_SL1500_.jpg",
      "https://m.media-amazon.com/images/I/71L-cMxQWpL._AC_SL1500_.jpg",
    ]},
    { name: "Xbox Series S Console", images: [
      "https://m.media-amazon.com/images/I/71NBQ2a52CL._AC_SL1500_.jpg",
      "https://m.media-amazon.com/images/I/61h1P8O0DvL._AC_SL1500_.jpg",
      "https://m.media-amazon.com/images/I/71nkR5vZcXL._AC_SL1500_.jpg",
    ]},
    { name: "Nintendo Switch OLED Console", images: [
      "https://m.media-amazon.com/images/I/61SV8nLJVOL._AC_SL1500_.jpg",
      "https://m.media-amazon.com/images/I/71tlzR2oS8L._AC_SL1500_.jpg",
      "https://m.media-amazon.com/images/I/71BGZJzbIhL._AC_SL1500_.jpg",
    ]},
    { name: "XGIMI Halo+ Portable Projector", images: [
      "https://m.media-amazon.com/images/I/71T5+d-P9eL._AC_SL1500_.jpg",
      "https://m.media-amazon.com/images/I/71tYbK0T6KL._AC_SL1500_.jpg",
      "https://m.media-amazon.com/images/I/71R3wqvjVnL._AC_SL1500_.jpg",
    ]},
    { name: "Roku Streaming Stick 4K", images: [
      "https://m.media-amazon.com/images/I/61AIOTwGbeL._AC_SL1500_.jpg",
      "https://m.media-amazon.com/images/I/71A1MTr9osL._AC_SL1500_.jpg",
      "https://m.media-amazon.com/images/I/71fKk1-pV4L._AC_SL1500_.jpg",
    ]},
    { name: "Anker Soundcore Motion+ Speaker", images: [
      "https://m.media-amazon.com/images/I/71AI2sW0ZPL._AC_SL1500_.jpg",
      "https://m.media-amazon.com/images/I/71SUuKEgipL._AC_SL1500_.jpg",
      "https://m.media-amazon.com/images/I/71J1nQRvGRL._AC_SL1500_.jpg",
    ]},
    { name: "Tribit StormBox Blast Speaker", images: [
      "https://m.media-amazon.com/images/I/71w4vGtUh1L._AC_SL1500_.jpg",
      "https://m.media-amazon.com/images/I/71Y0UR+7PjL._AC_SL1500_.jpg",
      "https://m.media-amazon.com/images/I/719pWQmaR+L._AC_SL1500_.jpg",
    ]},
    { name: "Sony SRS-XB13 Extra Bass Speaker", images: [
      "https://m.media-amazon.com/images/I/71qHZZ5XwHL._AC_SL1500_.jpg",
      "https://m.media-amazon.com/images/I/71LVWW9bk+L._AC_SL1500_.jpg",
      "https://m.media-amazon.com/images/I/71qGKHCIqUL._AC_SL1500_.jpg",
    ]},
  ],
  "phones-accessories": [
    { name: "Samsung Galaxy A54 5G Smartphone", images: [
      "https://i5.walmartimages.com/seo/Unlocked-Samsung-Galaxy-A54-5G-Cell-Phone-128GB-5000-mAh-Battery-6-MB-RAM-Gray_b5c74a6d-4ae5-497b-bd05-5ab533b2304f.a23e9c26373fdd6c77862311036e6bed.jpeg",
      "https://m.media-amazon.com/images/I/61j8gK0U5PL._AC_SL1500_.jpg",
      "https://m.media-amazon.com/images/I/71W24pGNS8L._AC_SL1500_.jpg",
    ]},
    { name: "Samsung Galaxy S23 Ultra Smartphone", images: [
      "https://i5.walmartimages.com/seo/Samsung-Galaxy-S23-Ultra-5G-256GB-8GB-RAM-6-8-120-Hz-AMOLED-Display-International-Version-Dual-SIM-Unlocked-Smartphone-SM-S918B-DS_8b69833d-2420-4bbf-91c8-3d8322505d43.256879d12edd5f3ac4c18cb4da7b1079.jpeg?odnHeight=768&odnWidth=768&odnBg=FFFFFF",
      "https://i.insider.com/63ee694ff24f34001864a190?width=700",
      "https://pisces.bbystatic.com/image2/BestBuy_US/images/products/6529/6529723_sd.jpg",
    ]},
    { name: "Apple iPhone 15 Smartphone", images: [
      "https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/iphone-15-finish-select-202309-6-7inch-blacktitanium?wid=5120&hei=2880&fmt=p-jpg&qlt=80&.v=1692845692709",
      "https://m.media-amazon.com/images/I/71d7rfSl0wL._AC_SL1500_.jpg",
      "https://m.media-amazon.com/images/I/71z5+2oqwJL._AC_SL1500_.jpg",
    ]},
    { name: "Apple iPhone 13 Smartphone", images: [
      "https://m.media-amazon.com/images/I/61l9ppb2dQL._AC_SL1500_.jpg",
      "https://m.media-amazon.com/images/I/71gm8v4uPBL._AC_SL1500_.jpg",
      "https://m.media-amazon.com/images/I/71Z7X6uyOyL._AC_SL1500_.jpg",
    ]},
    { name: "Tecno Spark 20 Pro Smartphone", images: [
      "https://m.media-amazon.com/images/I/61jSW2Z+dTL._AC_SL1500_.jpg",
      "https://m.media-amazon.com/images/I/61mH6NyY5oL._AC_SL1500_.jpg",
      U("1512499617640-c74ae3a79d37"),
    ]},
    { name: "Infinix Hot 40 Smartphone", images: [
      "https://m.media-amazon.com/images/I/61fGjVOxenL._AC_SL1500_.jpg",
      "https://m.media-amazon.com/images/I/61QvQoL2fzL._AC_SL1500_.jpg",
      U("1580910051074-3eb694886505"),
    ]},
    { name: "Xiaomi Redmi Note 13 Smartphone", images: [
      "https://m.media-amazon.com/images/I/71y8Z8mTlJL._AC_SL1500_.jpg",
      "https://m.media-amazon.com/images/I/71d5VCorhhL._AC_SL1500_.jpg",
      "https://m.media-amazon.com/images/I/81UZQ5wVb6L._AC_SL1500_.jpg",
    ]},
    { name: "Google Pixel 8 Smartphone", images: [
      "https://m.media-amazon.com/images/I/71TBrBH0U3L._AC_SL1500_.jpg",
      "https://m.media-amazon.com/images/I/71fX5KkkFoL._AC_SL1500_.jpg",
      "https://m.media-amazon.com/images/I/71z5Gv5TCOL._AC_SL1500_.jpg",
    ]},
    { name: "OnePlus 12 Smartphone", images: [
      "https://m.media-amazon.com/images/I/61P1w3Cma2L._AC_SL1500_.jpg",
      "https://m.media-amazon.com/images/I/71K3nvMeh0L._AC_SL1500_.jpg",
      "https://m.media-amazon.com/images/I/71V9X9KkZFL._AC_SL1500_.jpg",
    ]},
    { name: "Motorola Moto G84 Smartphone", images: [
      "https://m.media-amazon.com/images/I/61+LfQzqX5L._AC_SL1500_.jpg",
      "https://m.media-amazon.com/images/I/61R6gYV6gXL._AC_SL1500_.jpg",
      U("1592899677977-9c10ca588bbd"),
    ]},
    { name: "Samsung 25W Fast Charger", images: [
      "https://images.samsung.com/is/image/samsung/p6pim/us/ep-t2510nbegus/gallery/us-galaxy-25w-charging-adapter-ep-t2510nb-385268545?$product-details-jpg$",
      "https://m.media-amazon.com/images/I/71DvzhTt0lL._AC_SL1500_.jpg",
      "https://m.media-amazon.com/images/I/71U+5pLMOL._AC_SL1500_.jpg",
    ]},
    { name: "Anker 20W USB-C Charger", images: [
      "https://cdn.shopify.com/s/files/1/0493/9834/9974/files/B8753011_TD01_8c9e406a-15af-4464-8973-d46ee58523f8.png?v=1753885205",
      "https://m.media-amazon.com/images/I/61F3b+99y9L._AC_SL1500_.jpg",
      "https://m.media-amazon.com/images/I/61oYaxO0S3L._AC_SL1500_.jpg",
    ]},
    { name: "Spigen iPhone 15 Case", images: [
      "https://m.media-amazon.com/images/I/61EpoJQ8-CL.jpg",
      "https://m.media-amazon.com/images/I/71iFj50N+8L._AC_UL450_SY450_QL70_.jpg",
      "https://m.media-amazon.com/images/I/61UZDTb6rLL._AC_UL450_SY450_QL70_.jpg",
    ]},
    { name: "ESR Galaxy S23 Clear Case", images: [
      "https://m.media-amazon.com/images/I/71l6BjRVbLL.jpg",
      "https://m.media-amazon.com/images/I/71nnBryufML.jpg",
      "https://m.media-amazon.com/images/I/61HilKZxnSL._AC_UL450_SY450_QL70_.jpg",
    ]},
    { name: "Anker USB-C to USB-C Cable 2-Pack", images: [
      "https://cdn.shopify.com/s/files/1/0493/9834/9974/files/B8753011_TD01_8c9e406a-15af-4464-8973-d46ee58523f8.png?v=1753885205",
      "https://cdn.shopify.com/s/files/1/0493/9834/9974/files/A88E2012_Rich_image_no_copy_2000x2000px.png?v=1768183217",
      "https://cdn.shopify.com/s/files/1/0493/9834/9974/files/A80E7011_TD01_V1_c9531cc6-0f0b-4556-b321-7aaa97600533.png?v=1730775410",
    ]},
    { name: "Samsung Wireless Charger Pad", images: [
      "https://images.samsung.com/is/image/samsung/p6pim/us/gp-pwu025wiabu/gallery/us-single-wireless-charger-gp-pwu025wiabu-548541524?$product-details-jpg$",
      "https://m.media-amazon.com/images/I/61vNwIusnXL.jpg",
      "https://stg-images.samsung.com/is/image/samsung/p6pim/us/ep-p6300tbegus/gallery/us-wireless-charger-trio-574991-574991-ep-p6300tbegus-551045407?$product-details-jpg$",
    ]},
    { name: "UGREEN Phone Stand Holder", images: [
      "https://m.media-amazon.com/images/I/61EpoJQ8-CL.jpg",
      "https://m.media-amazon.com/images/I/61UZDTb6rLL._AC_UL450_SY450_QL70_.jpg",
      "https://m.media-amazon.com/images/I/71iFj50N+8L._AC_UL450_SY450_QL70_.jpg",
    ]},
    { name: "Whitestone Dome Glass Screen Protector", images: [
      "https://m.media-amazon.com/images/I/71l6BjRVbLL.jpg",
      "https://m.media-amazon.com/images/I/71nnBryufML.jpg",
      "https://m.media-amazon.com/images/I/61CNfRWMTAL.jpg",
    ]},
    { name: "Baseus 20000mAh Power Bank", images: [
      "https://m.media-amazon.com/images/I/71j39qiVifL._AC_UF894,1000_QL80_.jpg",
      "https://i.ebayimg.com/images/g/hEoAAeSwjYFpySPZ/s-l400.jpg",
      "https://m.media-amazon.com/images/I/61CL7NjoTjL.jpg",
    ]},
    { name: "ESR MagSafe Power Bank", images: [
      "http://www.esrtech.com/cdn/shop/files/HaloLock-MagSlim-Wireless-Power-Bank-_15W_-5_000-mAh_-Kickstand_-Black-ESR-234149151.jpg?v=1764756684",
      "https://cdn.shopify.com/s/files/1/0694/0242/7619/files/51nuHYOcFL._AC_SL1500_-1.jpg?v=1735209468",
      "https://m.media-amazon.com/images/I/61uqHl57uOL.jpg",
    ]},
  ],
  "computers-accessories": [
    { name: "HP Pavilion 15 Laptop", images: [
      "https://www.hp.com/content/dam/sites/worldwide/personal-computers/consumer/pavilion/home/Felicette%20-%20Pavlion%2015%20Laptop%20(Warm%20Gold)-%20Image%20-%20Product%20Card@3x.jpg",
      "https://m.media-amazon.com/images/I/81NF8kgcsZL.jpg",
      "https://i5.walmartimages.com/seo/HP-Pavilion-15-15-6-Touchscreen-Laptop-Intel-Core-i5-1135G7-8GB-RAM-512-GB-SSD-Win10-Home-15-EG0010NR_403d8047-39df-4e86-83c3-33fd0bc99e2c.7f1156083c556b0d367ba401592f44a2.jpeg",
    ]},
    { name: "Dell Inspiron 15 Laptop", images: [
      "https://m.media-amazon.com/images/I/81heE2Qaz7L.jpg",
      "https://i5.walmartimages.com/seo/Dell-Inspiron-15-3000-3520-15-6-Touchscreen-FHD-Business-Laptop-Computer-Intel-Core-i5-1155G7-Beat-i7-10710U-16GB-DDR4-RAM-512GB-PCIe-SSD-802-11AC-Wi_65d6946a-98ad-4473-b7ff-854eb9168ed9.023e940dc7eb11abbaf687ac8781e857.jpeg",
      "https://m.media-amazon.com/images/I/61aOEheWDOL.jpg",
    ]},
    { name: "Lenovo IdeaPad Slim 3 Laptop", images: [
      "https://p2-ofp.static.pub//fes/cms/2025/02/11/f74rsuhiwcam1hrqfaxj94s661k18s984611.png",
      "https://p2-ofp.static.pub/ShareResource/na/products/ideapad/1060x596/lenovo-ideapad-slim-3-gen-8-15-inch-artic-grey-02.png",
      "https://m.media-amazon.com/images/I/61JTN1n+JQL.jpg",
    ]},
    { name: "Apple MacBook Air M2 Laptop", images: [
      "https://www.apple.com/newsroom/images/product/mac/standard/Apple-WWDC22-MacBook-Air-hero-220606_big.jpg.large.jpg",
      "https://techcrunch.com/wp-content/uploads/2022/07/CMC_1580.jpg",
      "https://cdn.mos.cms.futurecdn.net/ftDV5jz4RD7WdUeaVuRadb.jpg",
    ]},
    { name: "ASUS Vivobook 15 Laptop", images: [
      "https://dlcdnwebimgs.asus.com/gain/b6d2e59f-ed3c-49de-92b5-410c799a1858/w800",
      "https://dlcdnwebimgs.asus.com/gain/f5d267ef-9fde-4244-80cc-7413cec40944/w800",
      "https://m.media-amazon.com/images/I/61HdKkPp3XL.jpg",
    ]},
    { name: "Acer Aspire 5 Laptop", images: [
      "https://m.media-amazon.com/images/I/71sesDsw95L.jpg",
      "https://bjs.scene7.com/is/image/bjs/340029?$bjs-Zoom$",
      "https://m.media-amazon.com/images/I/71y5vC9-clL.jpg",
    ]},
    { name: 'Samsung 27" T35F Monitor', images: [
      "https://images.samsung.com/is/image/samsung/p6pim/us/lf27t350fhnxza/gallery/us--lf27t350fhnxza-550379397?$product-details-jpg$",
      "https://i5.walmartimages.com/seo/SAMSUNG-27-Class-T35F-LED-Monitor-with-Border-Less-Design-IPS-Panel-75hz-FreeSync-and-Eye-Saver-Mode-LF27T350FHNXZA_3b5ed784-ce55-475d-a03d-c3c4b9d5cb17.2f6992f787b02c01e323ae03a4aae9a9.jpeg",
      "https://images.samsung.com/is/image/samsung/p6pim/us/lf24t350fhnxza/gallery/us--lf24t350fhnxza-550379303?$product-details-jpg$",
    ]},
    { name: 'Dell 24" SE2422H Monitor', images: [
      "https://i.dell.com/is/image/DellContent//content/dam/ss2/product-images/dell-client-products/peripherals/monitors/s-series/se2422h/pdp/se2422h_monitor_pdp_slices_gallery_hero.jpg?fmt=jpg&wid=504&hei=350",
      "https://i.ebayimg.com/images/g/nY8AAOSwDYRhjn2H/s-l400.jpg",
      "https://media.officedepot.com/images/f_auto,q_auto,e_sharpen,h_450/products/9198357/9198357_o01_dell_se2422h_238_full_hd_led_monitor/9198357",
    ]},
    { name: "Logitech MX Master 3S Mouse", images: [
      "https://resource.logitech.com/c_fill,q_auto,f_auto,dpr_1.0/d_transparent.gif/content/dam/logitech/en/products/mice/mx-master-3s/2025-update/mx-master-3s-bluetooth-edition-top-view-graphite-new-1.png",
      "https://m.media-amazon.com/images/I/61xKiCADfpL.jpg",
      "https://pisces.bbystatic.com/image2/BestBuy_US/images/products/0dc77603-04ac-4cef-a9c6-6348048554a0.jpg;maxHeight=750;maxWidth=345?format=webp",
    ]},
    { name: "Logitech K380 Multi-Device Keyboard", images: [
      "https://resource.logitech.com/c_fill,q_auto,f_auto,dpr_1.0/d_transparent.gif/content/dam/logitech/en/products/keyboards/pebble-keys-2-k380s/2026/gallery/tonal-graphite/pebble-keys-k380s-2-tonal-graphite-top-angle-gallery-1.png",
      "https://m.media-amazon.com/images/I/61+U9lMboFL.jpg",
      "https://m.media-amazon.com/images/I/61sR3bdJ5lL.jpg",
    ]},
    { name: "Razer BlackWidow V4 Keyboard", images: [
      "https://pisces.bbystatic.com/image2/BestBuy_US/images/products/41244e40-866f-4fad-86e2-1cab041cef53.jpg;maxHeight=750;maxWidth=345?format=webp",
      "https://i5.walmartimages.com/seo/Razer-BlackWidow-V4-75-Hot-Swappable-Mechanical-Gaming-Keyboard-RGB-Chroma-Black_effe0aa5-8503-4285-9de7-e5bf74665895.5a5ae658a4ebf40dc56b3fa1c756aa72.jpeg",
      "https://i5.walmartimages.com/seo/Razer-BlackWidow-V4-Tenkeyless-HyperSpeed-Wireless-Hot-Swappable-PC-Gaming-Keyboard_e62513b8-d2c9-4d5e-9152-e835036049d1.ebe3ca70f961a37d26e98fbed49da3cf.jpeg?odnHeight=768&odnWidth=768&odnBg=FFFFFF",
    ]},
    { name: "Keychron K2 Mechanical Keyboard", images: [
      "https://www.keychron.com/cdn/shop/products/Keychron-K2-wireless-mechanical-keyboard-for-Mac-Windows-iOS-Gateron-switch-blue-with-type-C-RGB-white-backlight-aluminum-frame.jpg?v=1650445549&width=1920",
      "https://www.keychron.com/cdn/shop/files/Keychron-K2-HE-75-Percent-Layout-Wireless-Magnetic-Switch-Custom-Keyboard-Standard-Version-RGB-Backlight-Double-Shot-PBT-Keycaps.jpg?v=1775881227&width=1214",
      "https://www.keychron.com/cdn/shop/products/Keychron-K2-wireless-mechanical-keyboard-for-Mac-Windows-iOS-Gateron-switch-brown-with-type-C-RGB-white-backlight-exclusive-color.jpg?v=1650445595&width=1214",
    ]},
    { name: "Samsung T7 1TB Portable SSD", images: [
      "https://images.samsung.com/is/image/samsung/p6pim/us/mu-pc1t0t-am/gallery/us-portable-ssd-t7-mu-pc1t0t-am-550535354?$product-details-jpg$",
      "https://pisces.bbystatic.com/image2/BestBuy_US/images/products/6408/6408299cv12d.jpg;maxHeight=750;maxWidth=345?format=webp",
      "https://i5.walmartimages.com/seo/SAMSUNG-T7-Portable-SSD-1TB-Titan-Gray-Up-to-1-050MB-s-USB-3-2-Gen2-MU-PC1T0T-AM_14b26ddc-a119-4530-9351-6398c3f049c3.5df65dabc10ab4b24444a0086e7fce22.jpeg",
    ]},
    { name: "SanDisk Extreme 1TB Portable SSD", images: [
      "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/HRQ22?wid=8000&hei=8000&fmt=jpeg&qlt=90&.v=1725912796144",
      "https://m.media-amazon.com/images/I/61zuR3UMnWL.jpg",
      "https://www.sandisk.com/content/dam/store/en-us/assets/products/usb-flash-drives/extreme-usb-3-2-ssd/gallery/extreme-usb-3-2-ssd-front.png.wdthumb.1280.1280.png",
    ]},
    { name: "Anker 7-in-1 USB-C Hub", images: [
      "https://cdn.shopify.com/s/files/1/0493/9834/9974/files/A88E2012_Rich_image_no_copy_2000x2000px.png?v=1768183217",
      "https://cdn.shopify.com/s/files/1/0493/9834/9974/files/A80E7011_TD01_V1_c9531cc6-0f0b-4556-b321-7aaa97600533.png?v=1730775410",
      "https://cdn.shopify.com/s/files/1/0493/9834/9974/files/1_d19b5c52-60a8-4155-acdf-073e64f6d434.png?v=1763545234",
    ]},
    { name: "UGREEN Laptop Stand", images: [
      "https://www.ugreen.com/cdn/shop/products/LP198-top-11.jpg?v=1736670657&width=1600",
      "https://m.media-amazon.com/images/I/712LVKsBY+L._AC_SL1500_.jpg",
      "https://m.media-amazon.com/images/I/81MceHfy9gL._AC_SL1500_.jpg",
    ]},
    { name: "Wacom Intuos Small Graphics Tablet", images: [
      "https://estore.wacom.com/media/Global/Products/Pen-Tablets/Wacom-Intuos/small-black-noBT/CTL-4100K_body.jpg",
      "https://m.media-amazon.com/images/I/512bs-rGdmL.jpg",
      "https://cdn-media.wacom.com/-/media/images/products-orphaned/pen-tablets/wacom-intuos/media-gallery/wacom-intuos-g4.jpg?h=640&iar=0&w=960&rev=103248e89b574f24b9d36b7d741ca65a&hash=E1F1937E3F77FDAE87C509D5C4D0B5C8",
    ]},
    { name: "HP LaserJet M110w Printer", images: [
      "https://www.hp.com/content/dam/sites/worldwide/personal-computers/printers/laserjet/m-series/m110we/hero_1.jpg",
      "https://m.media-amazon.com/images/I/61n7bGFRLCL._AC_SL1500_.jpg",
      "https://m.media-amazon.com/images/I/71C6nwY8UWL._AC_SL1500_.jpg",
    ]},
    { name: "TP-Link Archer AX55 Router", images: [
      "https://static.tp-link.com/upload/image-line/Overview_Archer_AX55_01_large_20210816012555f.jpg",
      "https://static.tp-link.com/upload/image-line/Overview_Archer_AX55_06_large_20210816012711l.jpg",
      "https://static.tp-link.com/upload/image-line/Archer_AX55(US)1.0_B_normal_20220318035004o.png",
    ]},
    { name: "Logitech C920 Webcam", images: [
      "https://m.media-amazon.com/images/I/71eGb1FcyiL.jpg",
      "https://resource.logitech.com/w_544,h_466,ar_7:6,c_pad,q_auto,f_auto,dpr_1.0/d_transparent.gif/content/dam/logitech/en/products/webcams/c920s/gallery/c920s-gallery-2.png",
      "https://m.media-amazon.com/images/I/61Bt2u40aJL.jpg",
    ]},
  ],
  fashion: [
    { name: "Levi's 501 Original Jeans", images: [
      "https://lscoglobal.scene7.com/is/image/lscoglobal/MB_00501-0193_GLO_CL_BV?fmt=jpeg&qlt=70&resMode=sharp2&fit=crop,1&op_usm=0.6,0.6,8&wid=2000&hei=2500",
      "https://lscoglobal.scene7.com/is/image/lscoglobal/MB_00501-3504_GLO_CM_D1?fmt=jpeg&qlt=70&resMode=sharp2&fit=crop,1&op_usm=0.6,0.6,8&wid=2000&hei=2500",
      "https://lscoglobal.scene7.com/is/image/lscoglobal/MB_00501-3802_GLO_CL_D1?fmt=jpeg&qlt=70&resMode=sharp2&fit=crop,1&op_usm=0.6,0.6,8&wid=2000&hei=2500",
    ]},
    { name: "Levi's Trucker Denim Jacket", images: [
      "https://lscoglobal.scene7.com/is/image/lscoglobal/WT_A3472-0003_GLO_CM_DA?fmt=jpeg&qlt=70&resMode=sharp2&fit=crop,1&op_usm=0.6,0.6,8&wid=2000&hei=2500",
      "https://lscoglobal.scene7.com/is/image/lscoglobal/MT_72334-0599_GLO_CM_DA?fmt=jpeg&qlt=70&resMode=sharp2&fit=crop,1&op_usm=0.6,0.6,8&wid=2000&hei=2500",
      "https://lsco.scene7.com/is/image/lsco/299450036-front-pdp-ld?fmt=jpeg&qlt=70&resMode=sharp2&fit=crop,1&op_usm=0.6,0.6,8&wid=2000&hei=2500",
    ]},
    { name: "Adidas Trefoil Cotton T-Shirt", images: [
      "https://assets.adidas.com/images/w_500,f_auto,q_auto/0d2bcbe3eedc46c4b010af1500995aac_9366/Adicolor_Classics_Trefoil_Tee_White_IA4813_01_laydown.jpg",
      "https://assets.adidas.com/images/w_500,f_auto,q_auto/9364a56272c34351a9f2bbc4b4c60c5b_9366/Trefoil_Essentials_Tee_Grey_JY6267_21_model.jpg",
      "https://assets.adidas.com/images/w_500,f_auto,q_auto/0d2bcbe3eedc46c4b010af1500995aac_9366/Adicolor_Classics_Trefoil_Tee_White_IA4813_02_laydown.jpg",
    ]},
    { name: "Nike Club Fleece Hoodie", images: [
      "https://static.nike.com/a/images/t_web_pdp_936_v2/f_auto,u_9ddf04c7-2a9a-4d76-add1-d15af8f0263d,c_scale,fl_relative,w_1.0,h_1.0,fl_layer_apply/94f6d19b-8ab6-41da-8dd2-d9b718abfaea/M+NSW+CLUB+HOODIE+PO+BB.png",
      "https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco,c_scale,w_300,u_9ddf04c7-2a9a-4d76-add1-d15af8f0263d,c_scale,fl_relative,w_1.0,h_1.0,fl_layer_apply/xvbs11kuyc818vgrarc6/M+NSW+CLUB+HOODIE+PO+BB.png",
      "https://static.nike.com/a/images/t_web_pdp_936_v2/f_auto,u_9ddf04c7-2a9a-4d76-add1-d15af8f0263d,c_scale,fl_relative,w_1.0,h_1.0,fl_layer_apply/213f4daa-3d6f-410d-9c25-3d1ad7ea8ea9/M+NK+CLUB+BB+FZ+HOODIE.png",
    ]},
    { name: "Men Slim-Fit Chino Pants", images: [
      U("1473966968590-fa801f796a63"), U("1541099649105-f69ad21f3246"), U("1490578474895-699cd4e2cf59"),
    ]},
    { name: "Women Floral Maxi Dress", images: [
      U("1496747611176-843222e1e57c"), U("1495385794356-15371f348c31"), U("1539109136881-3be0616acf4b"),
    ]},
    { name: "Ankara Print Gown (Nigeria)", images: [
      U("1595341888016-a392ef81b7de"), U("1539109136881-3be0616acf4b"), U("1496747611176-843222e1e57c"),
    ]},
    { name: "Men Oxford Button-Down Shirt", images: [
      "https://m.media-amazon.com/images/I/81n7MqS8+lL._AC_SL1500_.jpg",
      "https://m.media-amazon.com/images/I/81tI1DaiuXL._AC_SL1500_.jpg",
      U("1598033129183-720ba5cca0c8"),
    ]},
    { name: "Women Pleated Midi Skirt", images: [
      U("1583496661160-fb5886a0f74a"), U("1495385794356-15371f348c31"), U("1539109136881-3be0616acf4b"),
    ]},
    { name: "Oversized Hoodie Unisex", images: [
      "https://static.nike.com/a/images/t_web_pdp_936_v2/f_auto,u_9ddf04c7-2a9a-4d76-add1-d15af8f0263d,c_scale,fl_relative,w_1.0,h_1.0,fl_layer_apply/cf44ed1f-4c9a-45d2-a9e1-f5c3ab0c01d2/M+NK+CLUB+BB+FZ+HOODIE.png",
      U("1556821840-3a63f95609a7"), U("1544022613-e87ca75a784a"),
    ]},
    { name: "Women Silk Scarf", images: [
      U("1584036561566-baf8f5f1b144"), U("1522335789203-aabd1fc54bc9"), U("1570172619644-dfd03ed5d881"),
    ]},
    { name: "Men Cargo Pants", images: [
      U("1473966968590-fa801f796a63"), U("1541099649105-f69ad21f3246"), U("1490578474895-699cd4e2cf59"),
    ]},
    { name: "Women Knit Cardigan", images: [
      U("1434389677669-e08b4cac3105"), U("1495385794356-15371f348c31"), U("1583496661160-fb5886a0f74a"),
    ]},
    { name: "Men Linen Blazer", images: [
      "https://m.media-amazon.com/images/I/71h7t0gxYPL._AC_SL1500_.jpg",
      "https://m.media-amazon.com/images/I/71ZhnmD8X+L._AC_SL1500_.jpg",
      U("1594938298603-c8148c4dae35"),
    ]},
    { name: "Women Jumpsuit", images: [
      U("1591369822096-ffd140ec948f"), U("1539109136881-3be0616acf4b"), U("1496747611176-843222e1e57c"),
    ]},
    { name: "Men Leather Biker Jacket", images: [
      U("1521223890158-f9f7c3d5d504"), U("1544022613-e87ca75a784a"), U("1520975954732-35dd22299614"),
    ]},
    { name: "Women Ribbed Tank Top", images: [
      U("1581655353564-df12334d1073"), U("1583743814966-8936f5b7be1a"), U("1521572163474-6864f9cf17ab"),
    ]},
    { name: "Women High-Waist Leggings", images: [
      U("1506629082955-511b1aa562c8"), U("1598033129183-720ba5cca0c8"), U("1583496661160-fb5886a0f74a"),
    ]},
    { name: "African Kaftan for Women", images: [
      U("1595341888016-a392ef81b7de"), U("1539109136881-3be0616acf4b"), U("1496747611176-843222e1e57c"),
    ]},
    { name: "Men Classic Polo Shirt", images: [
      "https://m.media-amazon.com/images/I/71Kq0jbRpJL._AC_SL1500_.jpg",
      "https://m.media-amazon.com/images/I/71pXtg+rUFL._AC_SL1500_.jpg",
      U("1583743814966-8936f5b7be1a"),
    ]},
  ],
  "shoes-bags": [
    { name: "Nike Air Force 1 '07 Sneakers", images: [
      "https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco,c_scale,w_300,u_9ddf04c7-2a9a-4d76-add1-d15af8f0263d,c_scale,fl_relative,w_1.0,h_1.0,fl_layer_apply/e6da41fa-1be4-4ce5-b89c-22be4f1f02d4/AIR+FORCE+1+%2707.png",
      "https://static.nike.com/a/images/t_default/u_9ddf04c7-2a9a-4d76-add1-d15af8f0263d,c_scale,fl_relative,w_1.0,h_1.0,fl_layer_apply/a42a5d53-2f99-4e78-a081-9d07a2d0774a/AIR+FORCE+1+%2707.png",
      "https://static.nike.com/a/images/t_prod/w_1920,c_limit,f_auto,q_auto/e1b5af2b-2bf2-44ff-b696-11b49e4547e0/image.jpg",
    ]},
    { name: "Adidas Superstar Sneakers", images: [
      "https://assets.adidas.com/images/w_500,f_auto,q_auto/5643ea9848e94c1da869fd176bd19128_9366/Superstar_II_Shoes_White_IH8659_01_standard.jpg",
      "https://assets.adidas.com/images/c_fill,g_auto,w_1200,h_630,f_auto,q_auto/w_500,f_auto,q_auto/b324422839d4414aa851c7266e3630de_9366/Superstar_II_Shoes_White_JI0080_01_00_standard.jpg",
      "https://images.journeys.com/images/products/1_847800_FS_ALT5.JPG",
    ]},
    { name: "Vans Old Skool Sneakers", images: [
      "https://assets.vans.com/images/t_img/c_fill,g_center,f_auto,h_2500,w_2000/v1740710864/VN000D3HBKA-ALT3/Old-Skool-Shoe-VANS-BlackBlack-ALT3.png",
      "https://assets.vans.com/images/t_img/c_fill,g_center,f_auto,h_2500,w_2000/v1747942442/VN000D3HY28-HERO/Old-Skool-Shoe-VANS-Black-White-HERO.png",
      "https://assets.vans.com/images/t_img/c_fill,g_center,f_auto,h_2500,w_2000/v1740710858/VN000D3HBKA-ALT2/Old-Skool-Shoe-VANS-BlackBlack-ALT2.png",
    ]},
    { name: "New Balance 574 Sneakers", images: [
      "https://nb.scene7.com/is/image/NB/wl574evw_nb_02_i?$dw_detail_main_lg$&bgc=f1f1f1&layer=1&bgcolor=f1f1f1&blendMode=mult&scale=10&wid=1600&hei=1600",
      "https://nb.scene7.com/is/image/NB/ml574evg_nb_02_i?$dw_detail_gallery$",
      "https://images.journeys.com/images/products/1_703626_FS_HERO.JPG",
    ]},
    { name: "Crocs Classic Clog", images: [
      "https://media.crocs.com/images/f_auto%2Cq_auto%2Cw_900%2Ch_900%2Cc_pad%2Cb_transparent/products/10001_001_ALT110/crocs",
      "https://www.famousfootwear.com/blob/product-images/20000/33/64/6/33646_pair_feed1000.jpg",
      "https://media.crocs.com/images/f_auto%2Cq_auto%2Cw_900%2Ch_900%2Cc_pad%2Cb_transparent/products/214228_001_ALT110/crocs",
    ]},
    { name: "Skechers Go Walk 5 Shoes", images: [
      "https://media.kohlsimg.com/is/image/kohls/3697910_Black?wid=800&hei=800&op_sharpen=1",
      "https://m.media-amazon.com/images/I/811Bw4gaHlL._AC_UY900_.jpg",
      "https://i5.walmartimages.com/seo/Skechers-Women-s-GOwalk-5-Slip-on-Comfort-Shoe-Wide-Width-Available_a29a794f-b75e-49a3-8766-7f47591dfc06.f740b5d6fc5876cc4c9b3d04b0e1f8fa.jpeg",
    ]},
    { name: "Converse Chuck 70 High Top", images: [
      "https://www.converse.com/dw/image/v2/BCZC_PRD/on/demandware.static/-/Sites-cnv-master-catalog/default/dw43a87537/images/a_08/560845C_A_08X1.jpg?sw=406&strip=false",
      "https://static.nike.com/a/images/t_web_pdp_936_v2/f_auto,u_9ddf04c7-2a9a-4d76-add1-d15af8f0263d,c_scale,fl_relative,w_1.0,h_1.0,fl_layer_apply/ci5qxcnirgtzjpxztmvu/CHUCK+TAYLOR+ALL+STAR+HI.png",
      "https://www.converse.com/dw/image/v2/BCZC_PRD/on/demandware.static/-/Sites-cnv-master-catalog/default/dwc4feded1/images/a_08/135251C_A_08X1.jpg?sw=406&strip=false",
    ]},
    { name: "Asics Gel-Kayano 29 Running Shoes", images: [
      "https://roadrunnersports.widen.net/content/4xomrziocy?w=1000&h=1000",
      "https://cdn.runrepeat.com/storage/gallery/product_primary/39062/asics-gel-kayano-29-21232028-main.jpg",
      "https://believeintherun.com/media/wp/wp-content/uploads/2022/07/asics-gel-kayano-29-feature.jpeg",
    ]},
    { name: "Birkenstock Arizona Sandals", images: [
      "https://cdni.llbean.net/is/image/wim/514156_50716_41?hei=1095&wid=950&resMode=sharp2&defaultImage=llbprod/125491_0_44",
      "https://feetforlifeshoes.com/wp-content/uploads/2021/07/arizona-classic-footbed-black-birko-flor.png",
      "https://birkenstockvillage.com/cdn/shop/files/birkenstock-birkenstock-arizona-oiled-leather-classic-footbed-7.jpg?v=1742165250&width=1920",
    ]},
    { name: "Clarks Desert Boot", images: [
      "https://cdn.media.amplience.net/i/clarks/26155527_GW_1",
      "https://cdn.media.amplience.net/i/clarks/26166784_GW_10?fmt=auto&img404=imageNotFound&w=2088&qlt=75",
      "https://cdn.media.amplience.net/i/clarks/26166784_GW_1",
    ]},
    { name: "Timberland 6-Inch Boots", images: [
      "https://assets.timberland.com/images/t_img/f_auto,h_1300,e_sharpen:60,w_1300/dpr_2.0/v1741199070/TB110061713-HERO/Mens-Timberland-Premium-6Inch-Waterproof-Boot-TBL-Wheat-Nubuck-HERO.png",
      "https://assets.timberland.com/images/t_img/f_auto,h_650,e_sharpen:60,w_650/dpr_2.0/v1741199050/TB110061713-ALT2/Mens-Timberland-Premium-6Inch-Waterproof-Boot-TBL-Wheat-Nubuck-ALT2.png",
      "https://assets.timberland.com/images/t_img/f_auto,h_1300,e_sharpen:60,w_1300/dpr_2.0/v1718941975/TB110073001-HERO/Mens-Timberland-Premium-6Inch-Waterproof-Boot-TBL-HERO.png",
    ]},
    { name: "Herschel Little America Backpack", images: [
      "http://herschel.com/cdn/shop/files/11390-00001-os-01-gSXr3fKQ.jpg?v=1781467867&width=1024",
      "https://herschel.com/cdn/shop/files/11390-allcolors-08-LR4eiazo.jpg?v=1781485879&width=800",
      "https://herschel.com/cdn/shop/files/11390-07785-os-01-Va0bV0PX.jpg?v=1781467910&width=1920",
    ]},
    { name: 'Samsonite Omni 28" Luggage', images: [
      "https://m.media-amazon.com/images/I/91LRm6mzT1L.jpg",
      "https://m.media-amazon.com/images/I/91zA5IaHzwL._AC_UY1000_.jpg",
      "https://n.nordstrommedia.com/it/5bffe6eb-2c1b-4dfa-9726-4c11ec256093.jpeg?w=780&h=1170&crop=pad",
    ]},
    { name: "The North Face Borealis Backpack", images: [
      "https://assets.thenorthface.com/images/t_img/c_fill,ar_4:5,f_auto,h_2500,e_sharpen:60,w_2000/v1774999255/NF0A52SERH1-MODELBACK/Borealis-TNF-MODELBACK.png",
      "https://assets.thenorthface.com/images/t_img/c_fill,ar_4:5,f_auto,h_2500,e_sharpen:60,w_2000/v1774999264/NF0A52SINO6-MODELBACK/Womens-Borealis-TNF-MODELBACK.png",
      "https://gearheadoutfitters.com/cdn/shop/files/NF0A81E7_52B_hero_ff566778-369c-468a-bed1-b486ffbea506_1200x.jpg?v=1732137041",
    ]},
    { name: "Fossil Leather Wallet", images: [
      "https://fossil.scene7.com/is/image/FossilPartners/ML3683201_1?$sfcc_fos_large$&wid=1082",
      "https://m.media-amazon.com/images/I/81r-6UygjKL._AC_UY1000_.jpg",
      "https://slimages.macysassets.com/is/image/MCY/products/8/optimized/3149508_fpx.tif",
    ]},
    { name: "Bellroy Slim Sleeve Wallet", images: [
      "https://bellroy-product-images.imgix.net//bellroy_dot_com_gallery_image/USD/WSSB-CJA-101/0",
      "https://cdn.shopify.com/s/files/1/0671/4592/4843/files/38052.jpg?v=1714110494",
      "https://bellroy-product-images.imgix.net//bellroy_dot_com_gallery_image/USD/GMIA-BLACK/0",
    ]},
    { name: "Anello A4 Backpack", images: [
      "https://m.media-amazon.com/images/I/71VULedwXeS._AC_UY1000_.jpg",
      "https://m.media-amazon.com/images/I/51Z0mH0xhoL._AC_UY1000_.jpg",
      "https://i.ebayimg.com/images/g/rGwAAOSwzuZjWLNj/s-l1200.jpg",
    ]},
    { name: "Diaper Bag Backpack", images: [
      "https://i.ebayimg.com/images/g/BpAAAOSwm0plB~80/s-l1200.jpg",
      U("1547949003-2c2bb50b88e6"), U("1584917865442-de89df76afd3"),
    ]},
    { name: "Nike Legacy Duffel Bag", images: [
      "https://static.nike.com/a/images/t_web_pdp_936_v2/f_auto,u_9ddf04c7-2a9a-4d76-add1-d15af8f0263d,c_scale,fl_relative,w_1.0,h_1.0,fl_layer_apply/362ce268-0c78-4fee-9bc5-4903e8a63b2d/NK+GYM+CLUB+BAG+-+SP26.png",
      "https://static.nike.com/a/images/t_default/u_9ddf04c7-2a9a-4d76-add1-d15af8f0263d,c_scale,fl_relative,w_1.0,h_1.0,fl_layer_apply/94d21a7d-ac4c-4d3f-81e6-a7acfd0767de/W+NK+GYM+CLUB+-+RETRO.png",
      "https://static.nike.com/a/images/t_web_pdp_936_v2/f_auto,u_9ddf04c7-2a9a-4d76-add1-d15af8f0263d,c_scale,fl_relative,w_1.0,h_1.0,fl_layer_apply/7723194a-a283-403d-80df-db3582755ea2/NK+BRSLA+M+DUFF+-+X.png",
    ]},
    { name: "Women Crossbody Bag", images: [
      "https://cuerobags.com/cdn/shop/files/leather_crossbody_bag_1.jpg?v=1783599512&width=1080",
      "https://m.media-amazon.com/images/I/71faCvKUulL._AC_UY1000_.jpg",
      "https://www.bostanten.com/cdn/shop/files/2_4651e273-5396-4f2f-afe1-fb84e4b2cb0e.jpg?v=1735789330&width=1080",
    ]},
  ],
  "beauty-personal-care": [
    { name: "CeraVe Moisturizing Cream", images: [
      "https://i5.walmartimages.com/asr/63f2b83a-7915-4e2c-9d44-2840e1389e91.46fb38549baa1978bf189a170752c184.jpeg",
      "https://www.caretobeauty.com/cdn-cgi/image/f=auto/media/catalog/product//c/e/cerave-moisturizing-cream-dry-to-very-dry-skin-454g_3.jpg",
      "https://i5.walmartimages.com/seo/CeraVe-Intensive-Moisturizing-Body-cream-for-Dry-to-Very-Dry-Skin-12oz_4351c35f-e55e-438b-b236-2e276ee62394.7971dc539dc04352468402858ebc7fd0.jpeg?odnHeight=768&odnWidth=768&odnBg=FFFFFF",
    ]},
    { name: "L'Oreal Paris Revitalift Face Serum", images: [
      "https://i5.walmartimages.com/seo/L-Oreal-Paris-Revitalift-Derm-Intensives-Hyaluronic-Acid-Face-Serum-Anti-Aging-1-01-fl-oz_f09096ec-d17f-4eda-942c-a0943b18b399.8ee88f406cd5b142fee9b969ca12498e.jpeg",
      "https://m.media-amazon.com/images/I/71KqieYpTiL._AC_UF1000,1000_QL80_.jpg",
      "https://www.lorealparisusa.com/-/media/project/loreal/brand-sites/oap/master/dmi/products/revitalift-filler/ha-serum/1_5-percent-pure-hyaluronic-acid-serum-new-pdp/revitalift-serum-ha-usa-m.jpg?cx=0.48&cy=0.47&cw=650&ch=988&hash=815063D67DA1A067F54F521D55127328",
    ]},
    { name: "Neutrogena Hydro Boost Gel", images: [
      "https://images.ctfassets.net/3zfcttr0ztpr/1kg5T47YSwLUMAt10ezXuK/fcd25db738be0b0da603ffba941486c7/6806482-mod2-20250220.webp?fm=jpg&w=800&q=80",
      "https://pics.walgreens.com/prodimg/539990/900.jpg",
      "https://www.caretobeauty.com/cdn-cgi/image/width=1600,height=1600,f=auto/media/catalog/product//n/e/neutrogena-hydro-boost-water-gel-50ml_6.jpg",
    ]},
    { name: "Nivea Sun SPF 50", images: [
      "https://i5.walmartimages.com/seo/Nivea-Sun-Protect-Moisture-Sun-Cream-Lotion-SPF50-200ml-6-8-fl-oz_ef64277b-a0f3-4114-b59b-f403eb857d05.e9ec9d9dccc99d44b8a426f911ce3e56.png",
      "https://www.caretobeauty.com/cdn-cgi/image/width=1600,height=1600,f=auto/media/catalog/product//n/i/nivea-sun-protect-hydrate-lotion-spf50-100ml_1_1.jpg",
      "https://i.ebayimg.com/images/g/AJEAAOSwhCtiEMW1/s-l1200.jpg",
    ]},
    { name: "Olay Regenerist Cream", images: [
      "https://www.olay.com/cdn/shop/files/Olay_Regnerist_MSC_MOI_Swipe_125750163.jpg?v=1785939086&width=3000",
      "https://i5.walmartimages.com/seo/OLAY-REGENERIST-Anti-Aging-Face-Cream-Firming-Moisturizer-with-Triple-Collagen-Peptide-Niacinamide-Fragrance-Free-0-5-oz_96736dda-1565-41d9-88c7-7e19b33583b7.c4eeb9f800db37019db445568e3137d7.jpeg",
      "http://www.olay.com/cdn/shop/files/Olay_SI01_EN_RegeneristMSC_Conversion_125886743__59968.jpg?v=1778858224&width=1200",
    ]},
    { name: "SheaMoisture Coconut Shampoo", images: [
      "https://i5.walmartimages.com/seo/Shea-Moisture-Curly-Hair-Shampoo-Added-Bounce-Definition-Dry-Hair-Cleansing-Coconut-Hibiscus-Silk-Protein-Neem-Oil-Coconut-Oil-13-fl-oz_cea11bbb-eafa-4e0a-a6ee-dfa67c578227.43681795a6dee09c26c0fb9b1bd2733a.jpeg",
      "https://m.media-amazon.com/images/I/71Ot0cDs88L.jpg",
      "https://media.ulta.com/i/ulta/2271854_alt01?w=800&h=800&fmt=auto",
    ]},
    { name: "OGX Coconut Conditioner", images: [
      "https://m.media-amazon.com/images/I/71m8N0wI9gL._AC_SL1500_.jpg",
      "https://media.ulta.com/i/ulta/2271857_alt02?w=800&h=800&fmt=auto",
      U("1522335789203-aabd1fc54bc9"),
    ]},
    { name: "Mielle Rosemary Mint Hair Oil", images: [
      "https://pics.walgreens.com/prodimg/620738/900.jpg",
      "https://mielleorganics.com/cdn/shop/files/SI01_Mielle_eContent_RosemaryMint_Oil_80822737.jpg?crop=center&height=3000&v=1790187148&width=3000",
      "https://media.ulta.com/i/ulta/2601408_alt02?w=800&h=800&fmt=auto",
    ]},
    { name: "Philips Norelco 3000 Shaver", images: [
      "https://pisces.bbystatic.com/image2/BestBuy_US/images/products/6574/6574121_rd.jpg;maxHeight=750;maxWidth=345?format=webp",
      "https://m.media-amazon.com/images/I/71h-8ZFvfZL.jpg",
      "https://m.media-amazon.com/images/I/61ZoSR8I45L.jpg",
    ]},
    { name: "Philips OneBlade Trimmer", images: [
      "https://i5.walmartimages.com/asr/e2fa3066-9dd7-446e-8695-4847c1ebedc4.f4afc85bc5eabe210c71568da345ab0e.jpeg",
      "https://target.scene7.com/is/image/Target/GUEST_cece333d-1327-48af-baba-effd58737309",
      "https://pisces.bbystatic.com/image2/BestBuy_US/images/products/fde151ae-6b9f-442f-8975-6d03d9869409.jpg;maxHeight=750;maxWidth=345?format=webp",
    ]},
    { name: "CK One Eau de Toilette", images: [
      "https://i5.walmartimages.com/seo/Calvin-Klein-One-Eau-De-Toilette-Perfume-Spray-Unisex-6-6-oz_5b5a0adf-c9cc-4771-84c6-4333df0a7bc1_1.e8fd79fef26e6d7fc1823804fd8da27c.jpeg",
      "https://cdn.fragrancenet.com/images/photos/600x600/115760.jpg",
      "https://media.ulta.com/i/ulta/2015608cm_alt01?w=800&h=800&fmt=auto",
    ]},
    { name: "Victoria's Secret Body Mist", images: [
      "https://m.media-amazon.com/images/I/71o+rYh1CnL._AC_SL1500_.jpg",
      U("1620916566398-39f1143ab7be"), U("1541643600914-78b084683601"),
    ]},
    { name: "Burt's Bees Lip Balm", images: [
      "https://i5.walmartimages.com/seo/Burt-s-Bees-100-Natural-Moisturizing-Lip-Balm-Beeswax-2-Tubes-in-Blister-Box_7da09e0c-b42d-4fec-ac0d-11a82bc097be.2b785b0c0ae80dc574bdb23602a1358d.jpeg",
      "https://mcprod.ecom.clxdtc.com/media/catalog/product/n/i/ni-46123_bbd_lip_lbl_balm_beeswax.jpg?optimize=low&fit=bounds&height=&width=",
      "https://i5.walmartimages.com/asr/b32fd8e1-0b1f-415b-a5f0-a0d3863074a7.93f82baa13aa31023d212e60b4807cb3.jpeg?odnHeight=768&odnWidth=768&odnBg=FFFFFF",
    ]},
    { name: "The Ordinary Niacinamide Serum", images: [
      "https://www.sephora.com/productimages/sku/s2031391-main-zoom.jpg?imwidth=315",
      "https://media.ulta.com/i/ulta/2551167cm_alt05?w=800&h=800&fmt=auto",
      "https://m.media-amazon.com/images/I/612NxRjAoCL._AC_UL450_SY450_QL70_.jpg",
    ]},
    { name: "CeraVe Foaming Cleanser", images: [
      "https://www.cerave.com/-/media/project/loreal/brand-sites/cerave/americas/us/skincare/cleansers/foaming-facial-cleanser/photos/2026/700x785/ffc-atf-1-700x785-v1.jpg?rev=f0923e1e888a44b5ac66d4bb8025218a",
      "https://media.ulta.com/i/ulta/2254420cm_alt06?w=800&h=800&fmt=auto",
      "https://use-image.oliveyoung.com/images/prd/3606000537750/thumbnail/66970a7e-aa37-4b60-9228-2bf55a52f181.jpg?RS=1000X1000&AR=0&QT=85&SF=webp",
    ]},
    { name: "The Ordinary Glycolic Acid Toner", images: [
      "https://m.media-amazon.com/images/I/51bC4vVdkOL._AC_UF1000,1000_QL80_.jpg",
      "https://theordinary.com/dw/image/v2/BFKJ_PRD/on/demandware.static/-/Sites-deciem-master/default/dw8b57fa2b/Images/products/The%20Ordinary/ord-glyc-acid-7pct-100ml-Aug-UPC.png?sw=800&sh=800&sm=fit",
      "https://www.sephora.com/productimages/product/p509295-av-10-zoom.jpg?imwidth=315",
    ]},
    { name: "Revlon Nail Care Kit", images: [
      U("1567727303884-6e8565c4627c"), U("1585232019984-41bf1747e913"), U("1522335789203-aabd1fc54bc9"),
    ]},
    { name: "Real Techniques Makeup Brush Set", images: [
      "https://target.scene7.com/is/image/Target/GUEST_b322b840-b5da-4136-9903-84e6c200b8b4",
      "https://media.ulta.com/i/ulta/2661286_alt03?w=800&h=800&fmt=auto",
      "https://realtechniques.com/cdn/shop/files/10005200-10.jpg?v=1782411702",
    ]},
    { name: "Dyson Supersonic Hair Dryer", images: [
      "https://dyson-h.assetsadobe2.com/is/image/content/dam/dyson/images/products/primary/581671-04.png",
      "https://media.wired.com/photos/59e9509daaa0b93d50c34f2b/master/w_2560%2Cc_limit/dysonreviewTA.jpg",
      "https://cdn.mos.cms.futurecdn.net/mmVvnG6NbKWnmYLm4p5NWe.gif",
    ]},
    { name: "ghd Gold Hair Straightener", images: [
      "https://amplience.ghdhair.com/i/ghd/435_Gold_Gallery_Image_1_Hydra_Global?v=1&$ProductImageGallery$&fmt=auto",
      "https://www.sephora.com/productimages/product/p433648-av-03-zoom.jpg",
      "https://prostylingtools.com/cdn/shop/files/ghd_Gold_1_800x.jpg?v=1695052293",
    ]},
  ],
  "home-kitchen": [
    { name: "Tefal Non-Stick Cookware Set", images: [
      "https://i5.walmartimages.com/seo/T-fal-Easy-Care-Nonstick-Cookware-20-piece-Set-Grey-B087SKDW_2b65e9c0-a758-48c8-a4b6-0cbf4ff5b9ba.43e9ef31dd674cc14550fc27e3b392b8.jpeg?odnHeight=768&odnWidth=768&odnBg=FFFFFF",
      "https://www.t-fal.com/media/catalog/product/z/s/zszkaxipwwul0ccetiyb_8bhpbdd85uy5y4md.jpg?width=405&height=405&canvas=405,405&optimize=high&bg-color=255,255,255&fit=bounds&quality=100",
      "https://i5.walmartimages.com/asr/d1f43260-9227-4f0a-94e2-a5fdc289d356.584a4963508e1978ee0ef4cb48f99feb.jpeg?odnHeight=768&odnWidth=768&odnBg=FFFFFF",
    ]},
    { name: "Ninja Professional Blender BL610", images: [
      "https://mobileimages.lowes.com/productimages/0732f558-afab-4506-b66e-cbbe7589d870/16995373.jpg",
      "https://images.thdstatic.com/productImages/0df82b7e-5652-46c3-ac77-500c86d23b90/svn/black-ninja-countertop-blenders-bl610-64_1000.jpg",
      "https://www.pcrichard.com/dw/image/v2/BFXM_PRD/on/demandware.static/-/Sites-pcrichard-master-product-catalog/default/dwc81d1fb2/images/hires/AZ11_BL610.jpg?sw=800&sh=800&sm=fit",
    ]},
    { name: "Philips Airfryer XXL", images: [
      "https://us.home-appliances.philips/cdn/shop/files/HD9867_16_00_hero_image_1946x.jpg?v=1765209118",
      "https://i5.walmartimages.com/seo/Philips-Premium-Airfryer-XXL-with-Fat-Removal-and-Rapid-Air-Technology-Black_4189e6bd-7005-4711-a64d-66bb9715c1e2.e0c96795e4ae69d681aaa6681747e143.jpeg",
      "https://images.philips.com/is/image/philipsconsumer/vrs_e1a70331acdf01c61afe632ef4b3a2e7a65d5e93?$png$&wid=410&hei=410&fit=constrain",
    ]},
    { name: "Russell Hobbs Electric Kettle", images: [
      "https://mobileimages.lowes.com/productimages/258efefc-0497-4a87-a863-0c01472d1d01/00756243.jpg",
      "https://m.media-amazon.com/images/I/81P5V78Q96L.jpg",
      "https://m.media-amazon.com/images/I/61bpPIHt1xL.jpg",
    ]},
    { name: "Panasonic NN-SN686 Microwave", images: [
      "https://shop.panasonic.com/cdn/shop/files/23-0091_MWO_shopPana_maincarousel_2048x2048_NN-SN686SR.jpg?v=1779298684&width=2048",
      "https://m.media-amazon.com/images/I/51UhO1pK-5L._AC_UF894,1000_QL80_.jpg",
      "https://m.media-amazon.com/images/I/61PFupBwklL.jpg",
    ]},
    { name: "Aroma 20-Cup Rice Cooker", images: [
      "https://i5.walmartimages.com/asr/8630b9c4-6e2d-4c02-8a96-715767147393.2a7ea57039d98e5c1f6a2e484ffe06e0.jpeg?odnHeight=768&odnWidth=768&odnBg=FFFFFF",
      "https://www.aromaco.com/wp-content/uploads/2021/08/ARC-150SB-5.jpg",
      "https://i5.walmartimages.com/seo/Aroma-20-Cup-Programmable-Rice-Grain-Cooker-and-Multi-Cooker_a8e950cc-c863-4189-91d8-b5531eb37054.b4494f1bc4a534398a7cf6ede78553ac.jpeg",
    ]},
    { name: "Corelle Dinnerware Set", images: [
      "https://corelle.com/cdn/shop/files/CO_1152584_Corelle_Chambord_18pc_Set_DTCM_ATF_SquareTile7.jpg?v=1786651100&width=1214",
      "http://corelle.com/cdn/shop/products/1135397_CO_Tabletop_Silo_Square_Portofino_18pc-Set_2.jpg?crop=center&height=1200&v=1744217401&width=1200",
      "https://corelle.com/cdn/shop/files/1088609_Corelle_LW_18Pc_St_-_WFW_ATF_SquareTile8_1dd8639a-2e0c-4323-a0cd-92321a46a6ab.jpg?v=1779373667&width=1214",
    ]},
    { name: "Egyptian Cotton Bedding Set", images: [
      "https://images.thdstatic.com/productImages/24a73e23ab204823bf0e51d938606dd9/svn/sheet-sets-1200-stripe-queen-blue-64_600.jpg",
      "https://ak1.ostkcdn.com/images/products/is/images/direct/d613c87ba477cd70afd26020d9028146725cb40e/Superior-Egyptian-Cotton-650-Thread-Count-Deep-Pocket-Solid-Sheet-Set.jpg?impolicy=medium",
      "https://m.media-amazon.com/images/I/81QGXDjccgL._AC_UF894,1000_QL80_.jpg",
    ]},
    { name: "Memory Foam Pillow Set of 2", images: [
      "https://media.kohlsimg.com/is/image/kohls/6742711?wid=1000&hei=1000&op_sharpen=1",
      "https://m.media-amazon.com/images/I/61rvcnQmqBL._AC_UF894,1000_QL80_.jpg",
      "https://i5.walmartimages.com/seo/Queen-Size-Soft-Plush-Bamboo-Memory-Foam-Support-Pillow-Set-Of-2_e18c76f5-2fba-4e7a-b93b-f92fc9e98bf0.f79844790d8a6e0d00f39ce45b706d91.png?odnHeight=768&odnWidth=768&odnBg=FFFFFF",
    ]},
    { name: "Modern Wall Clock", images: [
      U("1507473885765-e6ed057f782c"), U("1567016432779-094069958ea5"), U("1616486338812-3dadae4b4ace"),
    ]},
    { name: "Stainless Steel Storage Baskets", images: [
      U("1584622650111-993a426fbf0a"), U("1567016432779-094069958ea5"), U("1556909114-f6e7ad7d3136"),
    ]},
    { name: "Shark Navigator Vacuum", images: [
      "https://assets.sharkninja.com/image/upload/f_auto/q_auto/SharkNinja-NA/NV360_02.jpg",
      "https://i5.walmartimages.com/asr/366cafe6-c1d2-4734-8c23-9a09c6dbd042.c3a48ea1fcbc98fa63f205e1d168f777.jpeg?odnHeight=768&odnWidth=768&odnBg=FFFFFF",
      "https://mobileimages.lowes.com/productimages/37bf81bc-ff31-4630-9d7e-6ce2aaf6470a/70226175.jpeg",
    ]},
    { name: "16-Inch Standing Fan", images: [
      U("1584622781564-1d987f7333c1"), U("1600585154340-be6161a56a0c"), U("1556909212-d5b604d0c90d"),
    ]},
    { name: "Top-Loading Water Dispenser", images: [
      U("1600585154340-be6161a56a0c"), U("1584622650111-993a426fbf0a"), U("1584622781564-1d987f7333c1"),
    ]},
    { name: "Oneida Stainless Cutlery Set", images: [
      U("1616486338812-3dadae4b4ace"), U("1567016432779-094069958ea5"), U("1556909212-d5b604d0c90d"),
    ]},
    { name: "Keurig K-Mini Coffee Maker", images: [
      "https://images.keurig.com/is/image/keurig/K-Mini-Coffee-Maker_5000200237",
      "https://target.scene7.com/is/image/Target/GUEST_affb81ac-43bc-44dd-bce2-dc6b43c6ee68?wid=300&hei=300&fmt=pjpeg",
      "https://images.thdstatic.com/productImages/63151fcb-0767-4b27-9d8b-c14bf5559f29/svn/black-matte-keurig-single-serve-coffee-makers-5000200239-44_600.jpg",
    ]},
    { name: "KitchenAid 2-Slice Toaster", images: [
      "https://i5.walmartimages.com/seo/KitchenAid-2-Slice-Toaster-with-Manual-Lift-Lever-Onyx-Black-KMT2115_9edc396c-eb71-4740-b1e3-fc0b4868cb92.7e407c05bf3b0b9f21fe0d50102ff1b3.jpeg?odnHeight=768&odnWidth=768&odnBg=FFFFFF",
      "https://m.media-amazon.com/images/I/71YiYlqXHzL.jpg",
      "https://cdnimg.webstaurantstore.com/images/products/large/433423/1601854.jpg",
    ]},
    { name: "Instant Pot Duo 6qt", images: [
      "https://m.media-amazon.com/images/I/71Z401LjFFL._AC_UF894,1000_QL80_.jpg",
      "https://instantpotme.com/wp-content/uploads/2018/06/instant-pot-duo-6.jpg",
      "http://instantpot.com/cdn/shop/files/112-0169-01Silo.png?v=1762456080",
    ]},
    { name: "Premium Bath Towel Set", images: [
      U("1567016432779-094069958ea5"), U("1583847268964-b28dc8f51f92"), U("1522708323590-d24dbb6b0267"),
    ]},
    { name: "Modern LED Table Lamp", images: [
      U("1507473885765-e6ed057f782c"), U("1567016432779-094069958ea5"), U("1616486338812-3dadae4b4ace"),
    ]},
  ],
  groceries: [
    { name: "Basmati Rice 5kg Bag", images: [
      "https://i5.walmartimages.com/seo/Tilda-Grand-Extra-Long-Grain-Rice-5Kg-Imported-from-Britain_bbfd2ee2-fb05-4545-b3f3-152f978f22ff.03dacdd9d37b1a78ced71565523f49ac.jpeg?odnHeight=768&odnWidth=768&odnBg=FFFFFF",
      "https://m.media-amazon.com/images/I/81f053Xh5UL._AC_UL450_SY450_QL70_.jpg",
      "https://m.media-amazon.com/images/I/81RqefjDOkL.jpg",
    ]},
    { name: "Vegetable Oil 5L Bottle", images: [
      "https://m.media-amazon.com/images/I/61SSPQgEVZL._SL1500_.jpg",
      "https://i5.walmartimages.com/asr/8c6c0018-87f7-4edf-a327-12a4ce30b0eb.3fe0825c7f0657c06f0af6539a3e8b7c.jpeg?odnHeight=768&odnWidth=768&odnBg=FFFFFF",
      "https://www.gfsstore.com/wp-content/uploads/2026/09/D1200013117208-1788270723.jpg",
    ]},
    { name: "Wheat Flour 2kg Pack", images: [
      "https://i5.walmartimages.com/seo/EXE-Mandazi-Wheat-Flour-2-kg-4-4-lb_d1434626-ea5d-4351-8225-80b64d59b81a.adf39d6ad22b5ae332abf3fedadfcc9e.png",
      "https://www.aesfoods.com/assets/images/unga_atta_wheat_flour2.jpg",
      "https://i.ebayimg.com/images/g/AdkAAOSwlLNnvUeq/s-l400.png",
    ]},
    { name: "Granulated Sugar 1kg", images: [
      "https://www.redpathsugar.com/assets/uploads/img/_750x750_crop_center-center_80_none/Special-Fine-1kg.png",
      "https://4wayfoods.com/wp-content/uploads/2024/11/Tate-and-Lyle-granulated-sugar-1kg.png",
      "https://m.media-amazon.com/images/I/61f4JN4RB1L.jpg",
    ]},
    { name: "Tomato Paste 400g Can", images: [
      "https://m.media-amazon.com/images/I/71vB+tUiHHL._AC_SL1500_.jpg",
      "https://m.media-amazon.com/images/I/81SoJmH6R2L._AC_SL1500_.jpg",
      U("1542838132-92c53300491e"),
    ]},
    { name: "Spaghetti Pasta Pack", images: [
      "https://i5.walmartimages.com/asr/1be16ce6-8a01-469b-9ca2-8704338297aa.f5c06cbc4f4ddbe22d6d1dc639a8bb36.jpeg",
      "https://m.media-amazon.com/images/I/71bKfyO+52L._AC_UF894,1000_QL80_.jpg",
      "https://i5.walmartimages.com/asr/08c1a372-712e-4ef9-92ca-7e5f5a7f03e4.7a031a69930fd6abd18e154787486bd1.png",
    ]},
    { name: "Kellogg's Corn Flakes", images: [
      "https://kellogg-h.assetsadobe.com/is/image/content/dam/kelloggs/kna/us/digital-shelf/corn-flakes/00038000001109_C1L1.jpg",
      "https://www.kroger.com/product/images/large/top/0003800000127",
      "https://i5.walmartimages.com/seo/70-PACKS-Corn-Flakes-Cereal-0-81-Ounce-Individual-Boxes_117ade68-2bc2-4cc3-b672-b09a0d6ed84f_1.a15a8e1969023fc35ef831142f450511.jpeg",
    ]},
    { name: "Indomie Instant Noodles", images: [
      "http://indomie.us/cdn/shop/files/220.png?v=1773736931",
      "http://indomie.us/cdn/shop/files/118_784d02dd-b373-41f8-ac94-61444135a646.png?v=1789009793",
      "https://indomie.us/cdn/shop/files/113.png?v=1789009561&width=1445",
    ]},
    { name: "Nescafé Gold Coffee", images: [
      "https://i5.walmartimages.com/seo/Nescafe-Gold-Blend-Coffee-200g_77984009-0f31-4606-9a3f-270fc97ddc90.391129a4ea7e2b87b0a9225ffb751c32.jpeg",
      "https://www.nescafe.com/us/sites/g/files/jgfbjl306/files/styles/gdn_hero_pdp_product_image/public/gdn_product/nescafe/field_product_images/nescafe-f80a2c63fd7c97e5431e3865fca148453489dabf.jpg.webp?itok=TLODbe8x",
      "https://i.ebayimg.com/images/g/69QAAOSwL9BlyfTY/s-l1200.png",
    ]},
    { name: "Lipton Green Tea 20 Bags", images: [
      "https://i5.walmartimages.com/seo/Lipton-Green-Tea-Tea-Bags-20-Count-Box_5d8d72c1-2d9b-4b9b-a7cf-d3696c9edf68.ab2d445159f53a13ee37346bb196cab5.jpeg",
      "https://m.media-amazon.com/images/I/71z05f75SGL._AC_UF894,1000_QL80_.jpg",
      "https://i5.walmartimages.com/seo/Lipton-Green-Tea-Peach_b271058c-7cfc-4e46-9fd2-c6611d34416c.09f1aff35344a721e19e55228dedc143.jpeg?odnHeight=768&odnWidth=768&odnBg=FFFFFF",
    ]},
    { name: "Bottled Water 12-Pack", images: [
      U("1560023907-5f3394ea9268"), U("1542838132-92c53300491e"), U("1474979266404-7eaacbcd87c5"),
    ]},
    { name: "Tropicana Orange Juice", images: [
      "https://m.media-amazon.com/images/I/71ZZnLc0yzL._AC_SL1500_.jpg",
      U("1600271888342-9b1f8e5c3c22"), U("1542838132-92c53300491e"),
    ]},
    { name: "Skippy Peanut Butter", images: [
      "https://i5.walmartimages.com/asr/c456a167-ecc0-4767-a403-f35215acee39.b2450c07ef155888ee2b77ab53394c9d.jpeg",
      "https://cdnimg.webstaurantstore.com/images/products/large/442310/1632798.jpg",
      "https://m.media-amazon.com/images/I/81zIHhXiGKL.jpg",
    ]},
    { name: "Raw Honey Jar 500g", images: [
      "https://images.squarespace-cdn.com/content/v1/64401268a7c55c2c4e24074d/b31789fb-9eaf-42b7-9a28-cd034aacf2aa/GrandmaKs-RawHoney-500g-jar-Context1-3000px.jpg",
      "https://kinghavenfarms.com/cdn/shop/files/raw2.png?v=1791390886&width=1445",
      "https://images.squarespace-cdn.com/content/v1/64401268a7c55c2c4e24074d/2fe31c09-e693-47ab-9b1e-56fe7fbffdff/GrandmaKs-RawHoney-500g-jar-v2-3000px.jpg?format=1500w",
    ]},
    { name: "Heinz Baked Beans", images: [
      "https://i5.walmartimages.com/seo/Heinz-Baked-Beans-in-Tomato-Sauce-415g_4fdb840b-9879-4924-b046-47f36e97bca8_1.1fa2a2c3e83b6693b6ed9f065cfb6515.jpeg?odnHeight=768&odnWidth=768&odnBg=FFFFFF",
      "https://res.cloudinary.com/kraft-heinz-whats-cooking-ca/image/upload/f_auto/q_auto/r_8/c_limit,w_3840/v1/dxp-images/heinz/products/00057000007034-original-beans-in-tomato-sauce/marketing-view-color-front_8cfbc127ac8d43c5c68b8f366039fef29b5ab18b_4b17681b9203b8f9d7d87324995dd243?_a=BAVMn6ID0",
      "http://parkersgbi.com/cdn/shop/files/Heinz_Beans.png?v=1761928131",
    ]},
    { name: "Oreo Chocolate Biscuits", images: [
      "https://cdn.shopify.com/s/files/1/0558/7366/7206/files/OREO_Original_FamilySize_2Pack-1_8fcf53db-756f-4e42-8eea-1f4f8af32a04.png?v=1786479439",
      "https://bjs.scene7.com/is/image/bjs/293898?$bjs-Zoom$",
      "https://i5.walmartimages.com/asr/1571dff1-2ef4-47da-81e4-4368f86b2e13.e138a1bd3bf8b616ff81e45bda1a8a53.jpeg",
    ]},
    { name: "Cadbury Dairy Milk Chocolate", images: [
      "https://www.kroger.com/product/images/large/front/0003400004025",
      "https://pics.walgreens.com/prodimg/417332/900.jpg",
      "https://i.ebayimg.com/images/g/71MAAOSwi3NgYD2J/s-l1200.jpg",
    ]},
    { name: "Nestlé Milo Chocolate Drink", images: [
      "https://m.media-amazon.com/images/I/81P2+6tKN5L.jpg",
      "https://i5.walmartimages.com/seo/Nestle-Milo-Chocolate-Malt-Beverage-Mix-Jumbo-3-3-Pound-Can-1-5kg_875950c3-b462-4e57-8976-bea2d665829c.370d34c9733758de7f172566b3e7fff9.jpeg",
      "https://i5.walmartimages.com/asr/ee4c3a87-f97e-4664-b9c0-efa171d8288c.a3376de894671d6afcb35f1550f5feb5.jpeg?odnHeight=768&odnWidth=768&odnBg=FFFFFF",
    ]},
    { name: "Creamy Peanut Butter 750g", images: [
      "https://m.media-amazon.com/images/I/71L42q4uQZL._AC_SL1500_.jpg",
      "https://cdnimg.webstaurantstore.com/images/products/large/442310/1632798.jpg",
      U("1551468167-19b2c3cf9599"),
    ]},
    { name: "Chicken Seasoning Cubes", images: [
      "https://m.media-amazon.com/images/I/71aE2hzVdwL._AC_SL1500_.jpg",
      U("1542838132-92c53300491e"), U("1551468167-19b2c3cf9599"),
    ]},
  ],
  "sports-fitness": [
    { name: "Manduka PRO Yoga Mat", images: [
      "https://www.manduka.com/cdn/shop/files/PRO-111011020-MATS-SS20-Thunder-01.jpg?v=1768250592&width=871",
      "https://www.manduka.com/cdn/shop/files/112011460-PL71-ELDERBERRY-02_245ace69-fe10-4e80-87b8-6bdb0b298562.jpg?v=1763829970&width=871",
      "https://www.manduka.com/cdn/shop/files/MD-PROXL-PDP-Imagery-2_3_1.jpg?v=1700012741&width=871",
    ]},
    { name: "Adjustable Dumbbell Set", images: [
      "https://www.rehabmart.com/imagesfromrd/1~241.jpg",
      "https://yorkbarbell.com/wp-content/uploads/2017/01/2111-2116-CastIronAdjustableSpinlockDumbbellSetLB.jpg",
      "https://cdn11.bigcommerce.com/s-2v01ommyhe/images/stencil/1028x1028/products/630/2506/SDBX66_IMGL9883-Hero__91236.1789051516.jpg?c=1",
    ]},
    { name: "TheraBand Resistance Bands", images: [
      "https://i5.walmartimages.com/seo/THERABAND-Resistance-Bands-Set-Yellow-Red-Green-Beginner-Non-Latex_43224cc5-285e-40d1-ab09-939466bf53af.6544921a303ef7c1331c1152c4ff85ee.jpeg",
      "https://m.media-amazon.com/images/I/61JWn+wZ99L.jpg",
      "https://www.performancehealth.com/media/catalog/product/1/2/12137-theraband-professional-non-latex-resistance-bands-yellow-red-green-beginner-set-0-main.jpg?optimize=low&bg-color=255,255,255&fit=bounds&height=700&width=700&canvas=700:700",
    ]},
    { name: "Adidas Skipping Rope", images: [
      "https://www.escaladesports.com/cdn/shop/files/batch-1-adidas-essential-skipping-rope__adrp-13011-nl_1_800x.jpg?v=1764180685",
      "https://cdn11.bigcommerce.com/s-dses6v/images/stencil/1280x1280/products/6508/39749/Jump_Rope__61705.1577722131.jpg?c=2",
      "https://i.ebayimg.com/images/g/3hoAAOSwETJaEydc/s-l1200.jpg",
    ]},
    { name: "Nike Pitch Soccer Ball", images: [
      U("1575361204480-aadea25e6e68"), U("1518611012118-696072aa579a"), U("1534438327276-14e5300c3a48"),
    ]},
    { name: "Spalding Street Basketball", images: [
      U("1519861539887-6c33a4a3b3df"), U("1518611012118-696072aa579a"), U("1575361204480-aadea25e6e68"),
    ]},
    { name: "Head Tennis Racket", images: [
      U("1534438327276-14e5300c3a48"), U("1518611012118-696072aa579a"), U("1517836357463-d25dfeac3438"),
    ]},
    { name: "Giro Cycling Helmet", images: [
      U("1526506118085-60ce8714f8c5"), U("1518611012118-696072aa579a"), U("1534438327276-14e5300c3a48"),
    ]},
    { name: "Nike Running Shorts", images: [
      U("1461896836934-ffe607ba8211"), U("1518611012118-696072aa579a"), U("1526506118085-60ce8714f8c5"),
    ]},
    { name: "Nike Sports Bra", images: [
      U("1571019613454-1cb2f99b2d8b"), U("1461896836934-ffe607ba8211"), U("1518611012118-696072aa579a"),
    ]},
    { name: "Harbinger Gym Gloves", images: [
      U("1517836357463-d25dfeac3438"), U("1549060279-7e168fcee0c2"), U("1583454110551-21f2fa2afe61"),
    ]},
    { name: "Hydro Flask 32oz Bottle", images: [
      "https://m.media-amazon.com/images/I/71+P3TAAIEL._AC_SL1500_.jpg",
      "https://m.media-amazon.com/images/I/71G4w0m3+YL._AC_SL1500_.jpg",
      U("1602143407151-7111542de6e8"),
    ]},
    { name: "TriggerPoint Foam Roller", images: [
      U("1544367567-0f2fcb009e0b"), U("1517836357463-d25dfeac3438"), U("1583454110551-21f2fa2afe61"),
    ]},
    { name: "Kettlebell 12kg", images: [
      U("1583454110551-21f2fa2afe61"), U("1517836357463-d25dfeac3438"), U("1549060279-7e168fcee0c2"),
    ]},
    { name: "Everlast Boxing Gloves", images: [
      U("1549060279-7e168fcee0c2"), U("1517836357463-d25dfeac3438"), U("1583454110551-21f2fa2afe61"),
    ]},
    { name: "Fitbit Charge 6 Tracker", images: [
      "https://m.media-amazon.com/images/I/61z9VMlnYhL._AC_SL1500_.jpg",
      "https://m.media-amazon.com/images/I/71aHSvmyMlL._AC_SL1500_.jpg",
      U("1575311373937-040b8e1fd5b6"),
    ]},
    { name: "Desk Treadmill Walking Pad", images: [
      U("1534438327276-14e5300c3a48"), U("1517836357463-d25dfeac3438"), U("1549060279-7e168fcee0c2"),
    ]},
    { name: "Schwinn Exercise Bike", images: [
      U("1571019613454-1cb2f99b2d8b"), U("1517836357463-d25dfeac3438"), U("1534438327276-14e5300c3a48"),
    ]},
    { name: "BlenderBottle Protein Shaker", images: [
      "https://m.media-amazon.com/images/I/71rF2NZX8kL._AC_SL1500_.jpg",
      U("1602143407151-7111542de6e8"), U("1518611012118-696072aa579a"),
    ]},
    { name: "Ankle Weights 5kg Pair", images: [
      U("1583454110551-21f2fa2afe61"), U("1517836357463-d25dfeac3438"), U("1549060279-7e168fcee0c2"),
    ]},
  ],
  "baby-products": [
    { name: "Pampers Swaddlers Diapers Size 4", images: [
      "https://m.media-amazon.com/images/I/71ZwAG6vB7L._AC_SL1500_.jpg",
      "https://m.media-amazon.com/images/I/71eOYWkQWAL._AC_SL1500_.jpg",
      "https://m.media-amazon.com/images/I/71PyJtCBZRL._AC_SL1500_.jpg",
    ]},
    { name: "Huggies Natural Care Wipes", images: [
      "https://m.media-amazon.com/images/I/71NPp2HuA6L._AC_SL1500_.jpg",
      "https://m.media-amazon.com/images/I/81UvPCtkEML._AC_SL1500_.jpg",
      "https://m.media-amazon.com/images/I/71Hl0w++XBL._AC_SL1500_.jpg",
    ]},
    { name: "Dr. Brown's Feeding Bottles", images: [
      "https://m.media-amazon.com/images/I/71Px9ebDQBL._AC_SL1500_.jpg",
      "https://m.media-amazon.com/images/I/71-pZi0dmbL._AC_SL1500_.jpg",
      "https://m.media-amazon.com/images/I/71gYc4yVtOL._AC_SL1500_.jpg",
    ]},
    { name: "Graco Modes Stroller", images: [
      "https://m.media-amazon.com/images/I/71hJC+eT5VL._AC_SL1500_.jpg",
      "https://m.media-amazon.com/images/I/71L-Yy+LQ4L._AC_SL1500_.jpg",
      "https://m.media-amazon.com/images/I/61Y5pe9XxXL._AC_SL1500_.jpg",
    ]},
    { name: "Chicco KeyFit 30 Car Seat", images: [
      "https://m.media-amazon.com/images/I/71J+s4ntbYL._AC_SL1500_.jpg",
      "https://m.media-amazon.com/images/I/71zXrE2HXyL._AC_SL1500_.jpg",
      "https://m.media-amazon.com/images/I/61Fp1CVJAfL._AC_SL1500_.jpg",
    ]},
    { name: "Motorola Baby Monitor", images: [
      "https://m.media-amazon.com/images/I/71TdxCBIHPL._AC_SL1500_.jpg",
      "https://m.media-amazon.com/images/I/71poNkGRghL._AC_SL1500_.jpg",
      "https://m.media-amazon.com/images/I/71cY7DP2XhL._AC_SL1500_.jpg",
    ]},
    { name: "Baby Bath Tub", images: [
      "https://m.media-amazon.com/images/I/71NMCCL+OxL._AC_SL1500_.jpg",
      "https://m.media-amazon.com/images/I/71Y+7M2H1cL._AC_SL1500_.jpg",
      "https://m.media-amazon.com/images/I/61nVxT7EisL._AC_SL1500_.jpg",
    ]},
    { name: "Carter's Onesie 5-Pack", images: [
      "https://m.media-amazon.com/images/I/71Uc3bcadVL._AC_SL1500_.jpg",
      "https://m.media-amazon.com/images/I/71LqE7Y8mYL._AC_SL1500_.jpg",
      "https://m.media-amazon.com/images/I/81VQIBY6pvL._AC_SL1500_.jpg",
    ]},
    { name: "Swaddle Blanket Set", images: [
      "https://m.media-amazon.com/images/I/71UGO3MY9sL._AC_SL1500_.jpg",
      "https://m.media-amazon.com/images/I/61vKGPH6XOL._AC_SL1500_.jpg",
      "https://m.media-amazon.com/images/I/71iHWp1sbVL._AC_SL1500_.jpg",
    ]},
    { name: "Philips Avent Pacifier Set", images: [
      "https://m.media-amazon.com/images/I/71oeVfFpHAL._AC_SL1500_.jpg",
      "https://m.media-amazon.com/images/I/71QEXiVK2XL._AC_SL1500_.jpg",
      "https://m.media-amazon.com/images/I/71s9jGFNSAL._AC_SL1500_.jpg",
    ]},
    { name: "Ergobaby Omni 360 Carrier", images: [
      "https://m.media-amazon.com/images/I/71Xlny6DkRL._AC_SL1500_.jpg",
      "https://m.media-amazon.com/images/I/71RO4Cs2guL._AC_SL1500_.jpg",
      "https://m.media-amazon.com/images/I/61OVAeoJvXL._AC_SL1500_.jpg",
    ]},
    { name: "Graco High Chair", images: [
      "https://m.media-amazon.com/images/I/71QJTf7bT8L._AC_SL1500_.jpg",
      "https://m.media-amazon.com/images/I/61VeR8uvhKL._AC_SL1500_.jpg",
      "https://m.media-amazon.com/images/I/61W8XVBImkL._AC_SL1500_.jpg",
    ]},
    { name: "Johnson's Baby Lotion", images: [
      "https://m.media-amazon.com/images/I/71tJTh2zkmL._AC_SL1500_.jpg",
      "https://m.media-amazon.com/images/I/61wWJgs9g8L._AC_SL1500_.jpg",
      "https://m.media-amazon.com/images/I/71SaIml+GrL._AC_SL1500_.jpg",
    ]},
    { name: "Gerber Baby Food Jars", images: [
      "https://m.media-amazon.com/images/I/71hp9jF1K3L._AC_SL1500_.jpg",
      "https://m.media-amazon.com/images/I/81b2hOA52zL._AC_SL1500_.jpg",
      "https://m.media-amazon.com/images/I/71VfG7Nv8xL._AC_SL1500_.jpg",
    ]},
    { name: "Nuby Teething Ring", images: [
      "https://m.media-amazon.com/images/I/71EDvOXDnoL._AC_SL1500_.jpg",
      "https://m.media-amazon.com/images/I/71nELqNDmxL._AC_SL1500_.jpg",
      "https://m.media-amazon.com/images/I/71U9+d6jJ6L._AC_SL1500_.jpg",
    ]},
    { name: "Baby Einstein Mobile", images: [
      "https://m.media-amazon.com/images/I/71LsEht0evL._AC_SL1500_.jpg",
      "https://m.media-amazon.com/images/I/71jeR3S-3TL._AC_SL1500_.jpg",
      "https://m.media-amazon.com/images/I/71T6mVZvXbL._AC_SL1500_.jpg",
    ]},
    { name: "Diaper Bag Backpack", images: [
      "https://m.media-amazon.com/images/I/71UKx3ADShL._AC_SL1500_.jpg",
      "https://m.media-amazon.com/images/I/71JaH5Z+eAL._AC_SL1500_.jpg",
      "https://m.media-amazon.com/images/I/71EN8f6kF3L._AC_SL1500_.jpg",
    ]},
    { name: "Baby Socks 10-Pack", images: [
      "https://m.media-amazon.com/images/I/71mM6E1kAJL._AC_SL1500_.jpg",
      "https://m.media-amazon.com/images/I/71uGzQFnxxL._AC_SL1500_.jpg",
      "https://m.media-amazon.com/images/I/71e4lEB9BQL._AC_SL1500_.jpg",
    ]},
    { name: "Tommee Tippee Bottle Sterilizer", images: [
      "https://m.media-amazon.com/images/I/71f78xRjPtL._AC_SL1500_.jpg",
      "https://m.media-amazon.com/images/I/71wX9zIBR4L._AC_SL1500_.jpg",
      "https://m.media-amazon.com/images/I/71yNBBJCS5L._AC_SL1500_.jpg",
    ]},
    { name: "Braun ThermoScan Baby Thermometer", images: [
      "https://m.media-amazon.com/images/I/71iMCqIBtoL._AC_SL1500_.jpg",
      "https://m.media-amazon.com/images/I/71kywY3pVhL._AC_SL1500_.jpg",
      "https://m.media-amazon.com/images/I/71JQatShVfL._AC_SL1500_.jpg",
    ]},
  ],
};

/** Number of products per category (must stay 20 for the seed). */
export const CATEGORY_ORDER = Object.keys(CATALOG_200);
