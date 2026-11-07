/**
 * Give every product its OWN real product photography (change 1, final pass).
 *
 * The first hosting pass left ~91 products sharing a category-pool image, so a
 * product could show a different item than its name. This hosts a real,
 * product-specific photo set for each of those products and assigns it, so
 * every product's images depict that exact product.
 */
import "dotenv/config";
import pg from "pg";
import { storagePutUrl, storageCommit } from "../server/_core/storage.ts";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36";

// exact product name -> real product photo URLs (all of the SAME product)
const MAP: Record<string, string[]> = {
  "Anker Soundcore Motion+ Speaker": [
    "https://cdn.shopify.com/s/files/1/0516/3761/6830/products/A3116011_TD07_V1_3840x.jpg?v=1752063364",
    "https://m.media-amazon.com/images/I/71AkH2N1c3L.jpg",
    "https://i.rtings.com/assets/products/Wz5IHTxF/anker-soundcore-motion-plus/design-medium.jpg?format=auto",
  ],
  "Apple AirPods 3rd Generation": [
    "https://cdsassets.apple.com/live/SZLF0YNV/images/sp/111863_airpods-3rdgen-2.png",
    "https://pisces.bbystatic.com/image2/BestBuy_US/images/products/4900/4900944_sd.jpg;maxHeight=750;maxWidth=345?format=webp",
  ],
  "Bose SoundLink Flex Speaker": [
    "https://assets.bosecreative.com/transform/326788e3-3bc9-4914-85fc-b7ed51100c61/SLFLXII_SF_PDP_03?quality=95",
    "https://m.media-amazon.com/images/I/7192Qca-fUL._AC_UL450_SY450_QL70_.jpg",
  ],
  "Canon EOS 2000D DSLR Camera": [
    "https://i5.walmartimages.com/asr/f02e92cd-540a-4e06-8b84-8f0b10b24138.d07db178ef7d20ff976e831ec53f845e.jpeg",
    "https://m.media-amazon.com/images/I/815opArtv4L.jpg",
  ],
  "Fujifilm Instax Mini 12 Instant Camera": [
    "https://m.media-amazon.com/images/I/61BfAlVB23L.jpg",
    "https://i5.walmartimages.com/seo/FUJIFILM-INSTAX-MINI-12-Instant-Film-Camera-Clay-White_56db9d5a-1b24-4139-bbd8-7fdcc1651898.0c8c827ff05a0105dc475cd6112a1b9e.jpeg",
  ],
  "GoPro HERO12 Black Action Camera": [
    "https://static.gopro.com/assets/blta2b8522e5372af40/blt7e6604006a422c70/64ddb11087561b55f9cc07da/03-pdp-h12b-CE-gallery-1920.png",
    "https://m.media-amazon.com/images/I/81s0t8v4NsL.jpg",
  ],
  "JBL Flip 6 Portable Bluetooth Speaker": [
    "https://www.jbl.com/dw/image/v2/BFND_PRD/on/demandware.static/-/Sites-masterCatalog_Harman/default/dw46cc380c/1_JBL_FLIP6_HERO_TEAL_29399_x1.png?sw=535&sh=535",
    "https://www.jbl.com/dw/image/v2/BFND_PRD/on/demandware.static/-/Sites-masterCatalog_Harman/default/dwf0f285ee/2_JBL_FLIP6_3_4_RIGHT_BLUE_30192_x1.png?sw=535&sh=535",
  ],
  "JBL Go 3 Compact Speaker": [
    "https://pisces.bbystatic.com/image2/BestBuy_US/images/products/6427/6427076ld.jpg;maxHeight=750;maxWidth=345?format=webp",
    "https://panthertech.fiu.edu/site/product-images/050036374262_image-01.jpg?resizeid=105&resizeh=1200&resizew=1200",
  ],
  'LG 43" UHD 4K Smart TV': [
    "https://media.us.lg.com/transform/ecomm-PDPGallery-1100x730/75f2a451-7338-4770-856b-6fb0f00b5007/43UR8000PUA_gallery_01_front_3000x3000",
    "https://media.us.lg.com/transform/ecomm-PDPGallery-1100x730/f4955672-06f9-4542-b605-75ab202635fe/md08002150-DZ-01_v1-jpg?io=transform:fill,width:1536",
  ],
  "Nintendo Switch OLED Console": [
    "https://assets.nintendo.com/image/upload/c_fill,w_1200/q_auto/f_auto/dpr_2.0/ncom/en_US/products/hardware/nintendo-switch-oled-model-white-set/115461-switch-oled-white-boxart-1200x675",
    "https://media.gamestop.com/i/gamestop/11149258/Nintendo-Switch-OLED-Console",
  ],
  "PlayStation 5 Slim Console": [
    "https://media.gamestop.com/i/gamestop/20009351",
    "https://m.media-amazon.com/images/I/41CCFesK0rL.jpg",
  ],
  "Roku Streaming Stick 4K": [
    "https://images.contentstack.io/v3/assets/blt50354f32a8eecd28/bltf330b75f6c434dec/67e443b5ae57b440f03ddf81/RSS4K-PDP-carousel-device_retail_box-780x600.png?branch=production",
    "https://images.contentstack.io/v3/assets/blt50354f32a8eecd28/blt2ee151f561e019af/67e332e5848c636580cfe69c/RSS4K-PDP-carousel-780x600-WITB.jpg?branch=production",
  ],
  'Samsung 55" Crystal 4K UHD Smart TV': [
    "https://images.samsung.com/is/image/samsung/p6pim/us/un55u8000ffxza/gallery/us-uhd-u8000f-un55u8000ffxza-545908095?$product-details-jpg$",
    "https://pisces.bbystatic.com/image2/BestBuy_US/images/products/dfe4f1a1-a5ba-48b8-bbed-c9900428f874.jpg;maxHeight=750;maxWidth=345?format=webp",
  ],
  "Sony Alpha A6100 Mirrorless Camera": [
    "https://m.media-amazon.com/images/I/71RNXPEkOnL._AC_UF894,1000_QL80_.jpg",
    "https://m.media-amazon.com/images/I/81m9F66ZUEL.jpg",
  ],
  "Sony SRS-XB13 Extra Bass Speaker": [
    "https://m.media-amazon.com/images/I/614pmXRPMFL.jpg",
    "https://pisces.bbystatic.com/image2/BestBuy_US/images/products/6456/6456735_sd.jpg;maxHeight=750;maxWidth=345?format=webp",
  ],
  "Sony WF-1000XM5 Wireless Earbuds": [
    "https://m.media-amazon.com/images/I/713IRzfhsEL.jpg",
    "https://i5.walmartimages.com/seo/Sony-WF-1000XM5-The-Best-Truly-Wireless-Noise-Canceling-Earbuds-Black_099a3dba-4a0f-448a-aeb4-dce9d0f66248.f48b4c06c8a233dd30466389ab6d0ffc.jpeg?odnHeight=768&odnWidth=768&odnBg=FFFFFF",
  ],
  "Sony WH-1000XM4 Wireless Headphones": [
    "https://i5.walmartimages.com/seo/Sony-WH-1000XM4-Wireless-Noise-Canceling-Over-Ear-Headphones-Silver-Bundle_b6dd1510-1e70-4f3d-a290-5256c3c83e98.d4d96560eda14de3d06711d0512ce487.jpeg",
    "https://pisces.bbystatic.com/image2/BestBuy_US/images/products/2e85dc98-1678-4a3a-b853-15f0de05a758.jpg",
  ],
  "Tribit StormBox Blast Speaker": [
    "https://m.media-amazon.com/images/I/81goPikPNgL._AC_UF894,1000_QL80_.jpg",
    "http://tribit.com/cdn/shop/products/01_eb51eeb9-4913-4147-acfe-116d9e196cd1.png?v=1710751804",
  ],
  "Xbox Series S Console": [
    "https://media.gamestop.com/i/gamestop/20006341/Microsoft-Xbox-Series-S-Digital-Console-1TB---Black",
    "https://content.abt.com/media/images/products/BDP_Images/microsoft-console-196388421343-packaging.jpg",
  ],
  "XGIMI Halo+ Portable Projector": [
    "https://us.xgimi.com/cdn/shop/products/5_b07a358f-5e4b-4194-8cb2-562abcf5410d.jpg?v=1770025417",
    "https://us.xgimi.com/cdn/shop/products/halo_3fdf71f1-a491-4fed-bcd9-ebb4c1885db3.jpg?v=1672211022",
  ],
  "Anker 7-in-1 USB-C Hub": [
    "https://m.media-amazon.com/images/I/71Z9T0VgGyL.jpg",
    "https://m.media-amazon.com/images/I/71ZzUx9bwlL._AC_UF894,1000_QL80_.jpg",
  ],
  "ASUS Vivobook 15 Laptop": [
    "https://dlcdnwebimgs.asus.com/gain/fd487e2a-aef9-4512-a9fe-cfd8134470e5/",
    "https://m.media-amazon.com/images/I/61HdKkPp3XL.jpg",
  ],
  "HP LaserJet M110w Printer": [
    "https://hp.widen.net/content/xw7apvxuuu/webp/xw7apvxuuu.png?w=573&h=430&dpi=72&color=ffffff00",
    "https://i5.walmartimages.com/seo/HP-LaserJet-M110w-Wireless-Printer-Print-Fast-speeds-Easy-setup-Mobile-printing-Best-for-home-office-and-small-business-AI-enabled_b67f2aca-d649-4013-9101-004e9d5132c9.e394c5e7b842f204a44943ab324093aa.jpeg",
  ],
  "Lenovo IdeaPad Slim 3 Laptop": [
    "https://pisces.bbystatic.com/image2/BestBuy_US/images/products/e1d256ca-d2c4-4466-9403-8f422e940305.jpg;maxHeight=750;maxWidth=345?format=webp",
    "https://m.media-amazon.com/images/I/61w0THscY3L.jpg",
  ],
  "Logitech K380 Multi-Device Keyboard": [
    "https://www.logitech.com/content/dam/logitech/en/products/keyboards/pebble-keys-2-k380s/2026/gallery/tonal-graphite/pebble-keys-k380s-2-tonal-graphite-top-angle-gallery-1.png",
    "https://m.media-amazon.com/images/I/61+U9lMboFL.jpg",
  ],
  "Razer BlackWidow V4 Keyboard": [
    "https://assets2.razerzone.com/images/pnx.assets/b2365984c607948cd60ebe738ea2e6b8/razer-blackwidow-v4-hero-desktop.webp",
    "https://pisces.bbystatic.com/image2/BestBuy_US/images/products/db34a04d-e8cb-4a6c-b0e8-8cb5450ca606.jpg;maxHeight=750;maxWidth=345?format=webp",
  ],
  'Samsung 27" T35F Monitor': [
    "https://images.samsung.com/is/image/samsung/p6pim/us/lf27t350fhnxza/gallery/us--lf27t350fhnxza-550379395?$product-details-jpg$",
    "https://images.samsung.com/is/image/samsung/p6pim/us/lf27t350fhnxza/gallery/us--lf27t350fhnxza-550379464?$product-details-jpg$",
  ],
  "UGREEN Laptop Stand": [
    "https://eu.ugreen.com/cdn/shop/products/ugreen-laptop-stand-for-desk-adjustable-820401.jpg?v=1697187385&width=3840",
    "https://m.media-amazon.com/images/I/61TgY7v-jxL.jpg",
  ],
  "Anker 20W USB-C Charger": [
    "https://cdn.shopify.com/s/files/1/0493/9834/9974/files/A2637116_TD01_V1_1e30e3ad-4e1f-495f-abde-9246b1e1ea78.png?v=1764230004",
    "https://i5.walmartimages.com/asr/ec805e40-a995-49ac-a39e-cb4017210e6c.783822ec5b8f630ca6ed9afea93c31b7.jpeg",
  ],
  "Anker USB-C to USB-C Cable 2-Pack": [
    "https://cdn.shopify.com/s/files/1/0493/9834/9974/files/A80E7011_TD01_V1_c9531cc6-0f0b-4556-b321-7aaa97600533.png?v=1730775410",
    "https://m.media-amazon.com/images/I/814oBlXCN8L.jpg",
  ],
  "Apple iPhone 13 Smartphone": [
    "https://www.apple.com/newsroom/images/product/iphone/standard/Apple_iphone13_hero_09142021_inline.jpg.slideshow-large_2x.jpg",
    "https://www.apple.com/newsroom/images/product/iphone/standard/Apple_iphone13_colors_09142021_big.jpg.large.jpg",
  ],
  "Baseus 20000mAh Power Bank": [
    "https://m.media-amazon.com/images/I/71j39qiVifL._AC_UF894,1000_QL80_.jpg",
    "https://i5.walmartimages.com/seo/Baseus-Laptop-Power-Bank-20000mAh-100W-Fast-Charging-Portable-Charger-with-Digital-Display-Blade-HD-Slim-Battery-Pack-for-Laptop-Black_61552acc-ad80-4772-a314-cd22494ef4c9.77f48bb63595f3888dfaa228ecbaa86b.jpeg",
  ],
  "ESR Galaxy S23 Clear Case": [
    "https://m.media-amazon.com/images/I/71lU6+JdNtL.jpg",
    "https://m.media-amazon.com/images/I/81kqBai8reL._AC_UF350,350_QL80_.jpg",
  ],
  "ESR MagSafe Power Bank": [
    "http://www.esrtech.com/cdn/shop/files/HaloLock-MagSlim-Wireless-Power-Bank-_15W_-5_000-mAh_-Kickstand_-Black-ESR-234149151.jpg?v=1764756684",
    "https://m.media-amazon.com/images/I/61uqHl57uOL.jpg",
  ],
  "Google Pixel 8 Smartphone": [
    "https://m.media-amazon.com/images/I/81Mya-dPIOL.jpg",
    "https://m.media-amazon.com/images/I/71SfoZu9a3L.jpg",
  ],
  "Infinix Hot 40 Smartphone": [
    "https://global.dev.infinixmobility.com/media/wysiwyg/x6836_hot40_base4.png",
    "https://m.media-amazon.com/images/I/61kDdP3vlHL._AC_UF1000,1000_QL80_.jpg",
  ],
  "Motorola Moto G84 Smartphone": [
    "https://m.media-amazon.com/images/I/71-5T7v0DpL.jpg",
    "https://i5.walmartimages.com/asr/ade9a094-39a0-4924-91a0-f78b4e7f2f30.8f4e7a0546a275faad1aa5d45f6894ed.jpeg",
  ],
  "OnePlus 12 Smartphone": [
    "https://image01.oneplus.net/media/202405/28/b96848b7acd10dafde32203d12f6fea7.png",
    "https://m.media-amazon.com/images/I/71NW2QaIzlL.jpg",
  ],
  "Samsung 25W Fast Charger": [
    "https://images.samsung.com/is/image/samsung/p6pim/us/ep-t2510nbegus/gallery/us-25w-power-adapter-ep-t2510-ep-t2510nbegus-550504221?$product-details-jpg$",
    "https://images.samsung.com/is/image/samsung/p6pim/us/ep-t2510nwegus/gallery/us-25w-power-adapter-ep-t2510-ep-t2510nwegus-550504232?$product-details-jpg$",
  ],
  "Samsung Galaxy S23 Ultra Smartphone": [
    "https://pisces.bbystatic.com/image2/BestBuy_US/images/products/6529/6529723_sd.jpg",
    "https://m.media-amazon.com/images/I/718LuUVEOZL.jpg",
  ],
  "Samsung Wireless Charger Pad": [
    "https://images.samsung.com/is/image/samsung/p6pim/us/gp-pwu025wiabu/gallery/us-single-wireless-charger-gp-pwu025wiabu-548541524?$product-details-jpg$",
    "https://pisces.bbystatic.com/image2/BestBuy_US/images/products/60a4bf9a-e39b-4b8b-8513-bee2ab6dd75d.jpg",
  ],
  "Spigen iPhone 15 Case": [
    "http://www.spigen.com/cdn/shop/products/title_web_iphone6.7p_rugged_armor_magfit_01.jpg?v=1695335474",
    "https://www.spigen.com/cdn/shop/files/title_web_iphone_15_pro_max_ultrahybrid_magfit_gold.jpg?v=1749840254&width=1946",
  ],
  "Tecno Spark 20 Pro Smartphone": [
    "https://d13pvy8xd75yde.cloudfront.net/global/spark-20-pro/product/bai.png",
    "https://d13pvy8xd75yde.cloudfront.net/global/spark-20-pro/product/jin.png",
  ],
  "UGREEN Phone Stand Holder": [
    "https://m.media-amazon.com/images/I/615ONlJKBJL._AC_UF894,1000_QL80_.jpg",
    "https://m.media-amazon.com/images/I/61B8LmrSu1L.jpg",
  ],
  "Whitestone Dome Glass Screen Protector": [
    "https://m.media-amazon.com/images/I/61kZDpz-hIL.jpg",
    "https://m.media-amazon.com/images/I/61Tw5wPe8BL.jpg",
  ],
  "Xiaomi Redmi Note 13 Smartphone": [
    "https://m.media-amazon.com/images/I/511ZbcUbopL.jpg",
    "https://m.media-amazon.com/images/I/41lfaKG1ybL.jpg",
  ],
  "Bellroy Slim Sleeve Wallet": [
    "https://bellroy-product-images.imgix.net//bellroy_dot_com_gallery_image/USD/WSSB-CJA-101/0",
    "https://bellroy-product-images.imgix.net//bellroy_dot_com_gallery_image/USD/WNSC-BLK-301/0",
  ],
  "Birkenstock Arizona Sandals": [
    "https://www.birkenstock.com/on/demandware.static/-/Sites-master-catalog-amer/default/dw1cfc7138/151213/151213.jpg",
    "https://www.birkenstock.com/on/demandware.static/-/Sites-master-catalog-amer/default/dwb3d5222b/51791/51791.jpg",
  ],
  "Ankle Weights 5kg Pair": [
    "https://m.media-amazon.com/images/I/71UdnUo3jQL.jpg",
    "https://m.media-amazon.com/images/I/61dLKy0TYkL._AC_UF350,350_QL80_.jpg",
  ],
  "Desk Treadmill Walking Pad": [
    "https://www.walkingpad.com/cdn/shop/files/product_walkingpad-z1-treadmill-office-use.webp?v=1776671070&width=1946",
    "https://www.walkingpad.com/cdn/shop/files/product_WalkingPad_R3-treadmill-folded-white-background.webp?v=1776671370",
  ],
  "Everlast Boxing Gloves": [
    "https://www.everlast.com/cdn/shop/files/P00004050_Black_Back2-0318.jpg?v=1752075125&width=1946",
    "https://www.everlast.com/cdn/shop/files/MX_OG_Fight_Gloves.jpg?v=1756235655&width=1946",
  ],
  "Giro Cycling Helmet": [
    "https://vault.widen.net/content/smzkkfdvtm?w=1500&h=1500",
    "https://vault.widen.net/content/fmxk2bo70z?w=1500&h=1500",
  ],
  "Harbinger Gym Gloves": [
    "https://harbingerfitness.com/cdn/shop/files/HARB_16281_F_Pro_Gloves_3.0_Mens_Black_LS07_240523_No_Tattoos-2000x1383-a809554.jpg?v=1745256236",
    "https://i5.walmartimages.com/seo/Harbinger-Padded-Leather-Tan-Camo-Weight-Lifting-Gloves-XL_61b40de7-57cd-4649-b0fe-05127010a1d4.a82a091ce7d925baf28169bade173d67.jpeg",
  ],
  "Head Tennis Racket": [
    "https://cdn-mdb.head.com/CDN3/D/232606/1/1820x2428/squared.webp",
    "https://cdn-mdb.head.com/CDN3/D/232306/3/683x911/pwr-115.webp",
  ],
  "Hydro Flask 32oz Bottle": [
    "https://www.hydroflask.com/media/catalog/product/w/3/w32cts484-32-oz-wide-flex-cap-surf-straight_1.jpg",
    "https://www.hydroflask.com/media/catalog/product/cache/9526abe58a368536f220458005aa0000/W/T/WT32CFS346-studio-Straight.jpg",
  ],
  "Kettlebell 12kg": [
    "https://titan.fitness/cdn/shop/files/422161_01_6ae642ea-075a-4128-9927-c2bfa2740536.jpg?v=1731083808&width=800",
    "https://northerngymequipment.com/cdn/shop/files/Northern_12kg_Vinyl_Kettlebells_1024x.jpg?v=1776349299",
  ],
  "Nike Pitch Soccer Ball": [
    "https://static.nike.com/a/images/t_web_pdp_936_v2/f_auto,u_9ddf04c7-2a9a-4d76-add1-d15af8f0263d,c_scale,fl_relative,w_1.0,h_1.0,fl_layer_apply/e6f2a134-0431-441c-b972-c0c79c0cc9cd/NIKE+PITCH+-+FA26.png",
    "https://midwaysports.com/cdn/shop/files/AURORA_FZ7555-100_PHSFZ001-2000.jpg?crop=center&height=1200&v=1762199157&width=1200",
  ],
  "Nike Running Shorts": [
    "https://static.nike.com/a/images/t_web_pdp_936_v2/f_auto,u_9ddf04c7-2a9a-4d76-add1-d15af8f0263d,c_scale,fl_relative,w_1.0,h_1.0,fl_layer_apply/b6ab0c4a-7252-438a-b7f4-437fa8483bd5/M+NK+DF+FAST+3IN+BF+SHORT.png",
    "https://static.nike.com/a/images/t_web_pdp_936_v2/f_auto,u_9ddf04c7-2a9a-4d76-add1-d15af8f0263d,c_scale,fl_relative,w_1.0,h_1.0,fl_layer_apply/12b92ae5-3b06-4db8-b943-b29eca030745/M+NK+DF+MILER+7IN+2IN1+SHORT.png",
  ],
  "Nike Sports Bra": [
    "https://static.nike.com/a/images/t_web_pdp_936_v2/f_auto/d72ed07c-3bb0-4c68-b25d-471fb2c99e19/W+NP+DF+BRA+TT+GRX.png",
    "https://static.nike.com/a/images/t_web_pdp_936_v2/f_auto,u_9ddf04c7-2a9a-4d76-add1-d15af8f0263d,c_scale,fl_relative,w_1.0,h_1.0,fl_layer_apply/ced2be88-f221-4431-a02d-13157eb0b947/W+NK1+SPRT+BRA.png",
  ],
  "Schwinn Exercise Bike": [
    "https://www.schwinnfitness.com/cdn/shop/files/schwinn-upright-bike-130-1.png?v=1765471069&width=1946",
    "https://www.schwinnfitness.com/cdn/shop/files/schwinn-230-recumbent-bike-100932.png?v=1765321072&width=1946",
  ],
  "Spalding Street Basketball": [
    "https://m.media-amazon.com/images/I/7187crn3osS._AC_UF1000,1000_QL80_.jpg",
    "https://i5.walmartimages.com/seo/Spalding-Street-Phantom-Outdoor-Basketball-Neon-Yellow-29-5_a4c0c0fa-e89f-4861-989b-973dd56c16ef.fc34412687c25a30fff8ab93dec8c32a.jpeg",
  ],
  "TriggerPoint Foam Roller": [
    "https://cdn.shopify.com/s/files/1/1515/2714/files/TriggerPoint_Grid1_FoamRoller_Orange_1200x1200.png?v=1769707589",
    "https://tptherapy.com/cdn/shop/files/fizf6rxl399brkyeju2g.jpg?v=1750694296",
  ],
  "16-Inch Standing Fan": [
    "https://i5.walmartimages.com/seo/Lasko-16-3-Speed-Adjustable-Oscillating-Pedestal-Fan-Black-S16500-New_c1064238-2a01-48ab-a3e9-733c944bb5cc.42a186ea9c76797166326ef3d6b29bb6.jpeg",
    "https://m.media-amazon.com/images/I/817BYrS+XAL.jpg",
  ],
  "Modern LED Table Lamp": [
    "https://m.media-amazon.com/images/I/81MeI8DBIlL._AC_UF894,1000_QL80_.jpg",
    "https://m.media-amazon.com/images/I/71XwU+RrzqL.jpg",
  ],
  "Modern Wall Clock": [
    "https://m.media-amazon.com/images/I/61Tgsc1y1KL._AC_UF894,1000_QL80_.jpg",
    "https://m.media-amazon.com/images/I/71giQS3QE3L._AC_UF894,1000_QL80_.jpg",
  ],
  "Oneida Stainless Cutlery Set": [
    "https://i5.walmartimages.com/asr/c5589055-c1b1-4882-9b5e-4868424b356b.3d34706bd9df7644f21ba6c7cd18a38f.png",
    "https://images.thdstatic.com/productImages/447121ae-9e90-5f92-8fb6-308de1756adf/svn/stainless-oneida-serving-sets-2766020al20-64_600.jpg",
  ],
  "Premium Bath Towel Set": [
    "https://ak1.ostkcdn.com/images/products/is/images/direct/39201cda4ff6fe4d6537fb5c80b5bea547d0428c/Superior-Luxury-Egyptian-Cotton-Bath-Towel-Set-of-4-Ultra-Plush%2C-Heavyweight%2C-Absorbent-Spa-%26-Hotel-Quality-Bath-Towels-Set.jpg?impolicy=medium",
    "https://images.thdstatic.com/productImages/bc848dce-96cf-4c93-bf38-f9629bde434d/svn/charcoal-lavish-home-bath-towels-67-0024-ch-64_1000.jpg",
  ],
  "Stainless Steel Storage Baskets": [
    "https://ak1.ostkcdn.com/images/products/is/images/direct/b2876aa9f787f08a9fa8abf47b56c4c5a07ca50b/Stainless-Steel-Mesh-Open-Storage-Basket-with-handles.jpg",
    "https://cdnimg.webstaurantstore.com/images/products/large/46389/2650606.jpg",
  ],
  "Top-Loading Water Dispenser": [
    "https://www.avalonh2o.com/cdn/shop/products/Black_Angle_2.jpg?v=1571255925&width=730",
    "https://pisces.bbystatic.com/image2/BestBuy_US/images/products/3fe7a64a-c5e8-407b-8e85-ecf7f686fdaf.jpg",
  ],
  "Revlon Nail Care Kit": [
    "https://www.revlon.com/cdn/shop/files/lz8izokg8qtpgksfivv4.jpg?v=1734017758&width=1800",
    "https://www.revlon.com/cdn/shop/files/revlon-ecomm-ATF-beauty-tools-thunder-manicure-essentials-kit-how-to-3000x3000.jpg?v=1734017795&width=1080",
  ],
  "Bottled Water 12-Pack": [
    "https://i5.walmartimages.com/seo/Pure-Life-Purified-Water-16-9-Fl-Oz-Plastic-Bottled-Water-12-Pack_1fb71447-418b-4c15-a216-cf6349efc648.5263ce920672c5d7dde390ea95502e38.jpeg",
    "https://i5.walmartimages.com/asr/9e8f1618-09d2-467b-87e9-e708200af6ec.b35e56ce17147ff5bcba09ebeff754b5.png",
  ],
  "Chicken Seasoning Cubes": [
    "https://m.media-amazon.com/images/I/A1OZZyM1F7L.jpg",
    "https://i5.walmartimages.com/asr/7dbb7d40-2761-4614-a76c-f064f7522d3e.232e330b92f2b33babd0993d09b4d76a.jpeg",
  ],
  "Creamy Peanut Butter 750g": [
    "https://i5.walmartimages.com/seo/Kraft-All-Natural-Peanut-Butter-with-Sea-Salt-750g-26-5oz-Creamy-Pure-Peanut-Butter_65375358-09d4-432d-bb7a-1a3021363314.ad4ff48574edf98d04ab5b90bb94a8b0.jpeg?odnHeight=768&odnWidth=768&odnBg=FFFFFF",
    "https://i5.walmartimages.com/seo/Kraft-Only-Peanuts-All-Natural-Smooth-Peanut-Butter-750g-4-Pack_050e36b7-61e0-4e85-a140-39be9e7da52a.ad3fb6ef4f2e40e72b904ad4a732a042.jpeg?odnHeight=768&odnWidth=768&odnBg=FFFFFF",
  ],
  "Skippy Peanut Butter": [
    "https://i5.walmartimages.com/asr/76450506-8fca-47b5-9519-0d2078317cd0.471c3efe4068b5a0feaeacf775ab3a25.jpeg",
    "https://i5.walmartimages.com/asr/7381484a-65e1-4e31-a07d-0ccdd4b20af3.fc4f322ac28b159f20982fbeaa5305c4.jpeg?odnHeight=768&odnWidth=768&odnBg=FFFFFF",
  ],
  "Tomato Paste 400g Can": [
    "https://i5.walmartimages.com/seo/Salsa-Tomato-Paste-400g-Step-Up-Flavor-with-Rich-Tomato-Goodness_6ca8a77f-010a-4452-bec2-0ab2037490b9.871ab81bc448c51618988a2933e04250.jpeg?odnHeight=768&odnWidth=768&odnBg=FFFFFF",
    "https://m.media-amazon.com/images/I/819BXrBoLIL._AC_UF894,1000_QL80_.jpg",
  ],
  "Tropicana Orange Juice": [
    "https://tropicana.com/images/products/tropicana-pure-premium-no-pulp-320.png",
    "https://m.media-amazon.com/images/I/81IrN3DV+YL.jpg",
  ],
  "African Kaftan for Women": [
    "https://africanattireshop.com/wp-content/uploads/2025/05/Green-Moroccan-Kaftan-Dress-with-Gold-Embroidery-and-Belt-Eid-and-Wedding-Wear-1.webp",
    "https://m.media-amazon.com/images/I/71iG6PtV2FL._AC_UY1000_.jpg",
  ],
  "Ankara Print Gown (Nigeria)": [
    "https://www.chimzi.com/wp-content/uploads/2022/07/A5912723-EE3A-424B-BB22-2535D24D1E91-scaled.jpeg",
    "https://dupsies.com/cdn/shop/files/Back-view-Ankara-African-print-dress-cross-shoulder-dupsies_300x.png?v=1766997562",
  ],
  "Men Cargo Pants": [
    "https://bernedirect.com/cdn/shop/products/echo-zero-six-concealed-carry-cargo-pant-530142.jpg?v=1697471510&width=960",
    "https://www.youngandreckless.com/cdn/shop/products/young-and-reckless-mens-bottoms-cargo-pants-ryder-cargo-pants-sand-29158755532903_1000x.jpg?v=1645058384",
  ],
  "Men Classic Polo Shirt": [
    "https://dtcralphlauren.scene7.com/is/image/PoloGSI/s7-1266689_alternate10?$rl_4x5_zoom$",
    "https://osklenusa.vtexassets.com/arquivos/ids/297603/7400210_MENS-CLASSIC-COTTON-POLO-SHIRT_1.jpg?v=639084227611230000",
  ],
  "Men Leather Biker Jacket": [
    "https://www.thejacketmaker.com/cdn/shop/files/Noah_Black_Leather_Biker_Jacket_For_Men_Made_of_100_Real_Sheepskin_Leather_1_cbe5afe2-6ef6-4fe4-a93b-1bca26b08b5d.jpg?v=1760637753",
    "https://m.media-amazon.com/images/I/71gBh++AOvL._AC_UF894,1000_QL80_.jpg",
  ],
  "Men Oxford Button-Down Shirt": [
    "http://americantall.com/cdn/shop/files/American-Tall-Men-Oxford-Cloth-Button-Down-Shirt-Deep-Black-Front_a377ab75-8ed4-4470-bcdd-5babeb465df5.jpg?v=1779914571",
    "https://cdn.shopify.com/s/files/1/0419/1525/files/1024x1024-Men-OxfordShirt-Black-100725-Front.jpg?v=1760979638",
  ],
  "Men Slim-Fit Chino Pants": [
    "https://us.dockers.com/cdn/shop/files/79488-0000_BA_900x1125_crop_center.jpg?v=1787773581",
    "https://m.media-amazon.com/images/I/616NrGVwJyL._AC_UY1000_.jpg",
  ],
  "Oversized Hoodie Unisex": [
    "https://mediahub.boohoo.com/cmm20564_charcoal_xl?qlt=70&w=549&ssz=true&dpr=1",
    "https://m.media-amazon.com/images/I/51lUeYlvKyL._AC_UY1000_.jpg",
  ],
  "Women Floral Maxi Dress": [
    "http://balticborn.com/cdn/shop/files/katherine-maxi-dress-cream-rust-floral-741227.jpg?v=1762198496",
    "https://m.media-amazon.com/images/I/91RIjFwW+mL._AC_UY1000_.jpg",
  ],
  "Women High-Waist Leggings": [
    "https://www.taviactive.com/cdn/shop/files/C214_Sunset-Pink_01.jpg?v=1778622572&width=800",
    "https://m.media-amazon.com/images/I/71a8K2AZmvL._AC_UF1000,1000_QL80_.jpg",
  ],
  "Women Jumpsuit": [
    "https://cdn11.bigcommerce.com/s-4wjdge/images/stencil/1280x1280/products/408/4122/Button_Up_Jumpsuit_Black_15__78958.1738349019.jpg?c=2",
    "https://m.media-amazon.com/images/I/612mSu9aqKL._AC_UY350_.jpg",
  ],
  "Women Knit Cardigan": [
    "https://cdn11.bigcommerce.com/s-scgdirr/products/17303/images/160061/1161_source_1748420198__79905.1771603877.560.850.jpg?c=2",
    "https://www.lulus.com/images/product/xlarge/2889731_New_02_front_2026-08-10.jpg?w=375&hdpi=1",
  ],
  "Women Pleated Midi Skirt": [
    "https://balticborn.com/cdn/shop/files/katie-pleated-midi-skirt-natural-302118.jpg?v=1772554415&width=1445",
    "https://americantall.com/cdn/shop/files/American-Tall-Women-Structured-Knit-Pleated-Midi-Skirt-White-Alyssum-Front_1500x.jpg?v=1785515198",
  ],
  "Women Ribbed Tank Top": [
    "https://www.cottonheritage.com/catImg/WAMHIRES/lc7703_120122164403.jpg",
    "https://m.media-amazon.com/images/I/61QPpJL8L0L._AC_UY1000_.jpg",
  ],
  "Women Silk Scarf": [
    "https://silksilky.com/cdn/shop/products/P016_SilkSilky_Pure_Silk_Scarf_009_C-210901015_0.jpg?v=1778735035",
    "https://elizabetta.net/cdn/shop/files/womens-rose-print-silk-satin-scarf_2048x.jpg?v=1762462404",
  ],
  "Diaper Bag Backpack": [
    "http://keababies.com/cdn/shop/files/20250314_-_Original_Diaper_Bag_Trendy_Black_Main_1A..jpg?v=1780996006",
    "https://m.media-amazon.com/images/I/81urLtW+pjL._AC_UF894,1000_QL80_.jpg",
  ],
};

function extFor(ct: string, url: string): string {
  if (ct.includes("png")) return "png";
  if (ct.includes("webp")) return "webp";
  if (ct.includes("gif")) return "gif";
  if (ct.includes("jpeg") || ct.includes("jpg")) return "jpg";
  const m = url.split("?")[0].match(/\.(png|jpe?g|webp|gif)$/i);
  return m ? m[1].toLowerCase().replace("jpeg", "jpg") : "jpg";
}

async function host(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: { "user-agent": UA, accept: "image/*,*/*" },
      redirect: "follow",
      signal: AbortSignal.timeout(20000),
    });
    if (!res.ok) return null;
    const ct = res.headers.get("content-type") ?? "";
    if (!ct.startsWith("image/")) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 1500) return null;
    const key = `products/p-${Math.random().toString(36).slice(2, 10)}.${extFor(ct, url)}`;
    const { uploadUrl, publicPath } = await storagePutUrl(key, ct);
    const put = await fetch(uploadUrl, { method: "PUT", headers: { "content-type": ct }, body: buf });
    if (!put.ok) return null;
    await storageCommit(key, { name: key.split("/").pop() });
    return publicPath;
  } catch {
    return null;
  }
}

// Host every mapped image once (concurrent, modest).
const hosted = new Map<string, string>();
const allUrls = [...new Set(Object.values(MAP).flat())];
const CONCURRENCY = 6;
const queue = [...allUrls];
async function worker() {
  for (;;) {
    const u = queue.shift();
    if (!u) return;
    const p = await host(u);
    if (p) hosted.set(u, p);
  }
}
await Promise.all(Array.from({ length: CONCURRENCY }, worker));
console.log(`hosted ${hosted.size}/${allUrls.length} images`);

// Assign per product.
let assigned = 0;
let missing = 0;
for (const [name, urls] of Object.entries(MAP)) {
  const paths = urls.map((u) => hosted.get(u)).filter((x): x is string => Boolean(x));
  if (paths.length === 0) {
    console.warn(`  no hosted image for "${name}"`);
    missing += 1;
    continue;
  }
  const rows = await pool.query<{ id: string }>("select id from products where name = $1", [name]);
  if (rows.rows.length === 0) {
    console.warn(`  product not found: "${name}"`);
    missing += 1;
    continue;
  }
  for (const row of rows.rows) {
    await pool.query("delete from product_images where product_id = $1", [row.id]);
    for (let i = 0; i < paths.length; i++) {
      await pool.query(
        "insert into product_images (id, product_id, url, sort_order) values (gen_random_uuid(), $1, $2, $3)",
        [row.id, paths[i], i],
      );
    }
    assigned += 1;
  }
}
console.log(`assigned: ${assigned}, missing: ${missing}`);

// Report any product still sharing an image with another product.
const shared = await pool.query<{ n: number }>(`
  select count(distinct p.id)::int as n
  from products p join product_images pi on pi.product_id = p.id
  where pi.url in (select url from product_images group by url having count(distinct product_id) > 1)
`);
console.log(`products still sharing an image: ${shared.rows[0].n}`);
await pool.end();
