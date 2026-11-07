/**
 * Real category photography (change 7) — replaces the letter-avatar
 * placeholders. Each entry is a real, hotlink-friendly product photo that
 * represents the department, used by the home grid, the categories page,
 * the mobile menu and the bottom navigation.
 */
export const CATEGORY_IMAGES: Record<string, string> = {
  electronics:
    "https://images.samsung.com/is/image/samsung/p6pim/us/un55u8000fxza/gallery/us-uhd-u8000f-un55u8000fxza-546200033?$product-details-jpg$",
  "phones-accessories":
    "https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/iphone-15-finish-select-202309-6-7inch-blacktitanium?wid=5120&hei=2880&fmt=p-jpg&qlt=80&.v=1692845692709",
  "computers-accessories":
    "https://www.hp.com/content/dam/sites/worldwide/personal-computers/consumer/pavilion/home/Felicette%20-%20Pavlion%2015%20Laptop%20(Warm%20Gold)-%20Image%20-%20Product%20Card@3x.jpg",
  fashion:
    "https://lscoglobal.scene7.com/is/image/lscoglobal/MB_00501-0193_GLO_CL_BV?fmt=jpeg&qlt=70&resMode=sharp2&fit=crop,1&op_usm=0.6,0.6,8&wid=2000&hei=2500",
  "shoes-bags":
    "https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco,c_scale,w_300,u_9ddf04c7-2a9a-4d76-add1-d15af8f0263d,c_scale,fl_relative,w_1.0,h_1.0,fl_layer_apply/e6da41fa-1be4-4ce5-b89c-22be4f1f02d4/AIR+FORCE+1+%2707.png",
  "beauty-personal-care":
    "https://i5.walmartimages.com/asr/63f2b83a-7915-4e2c-9d44-2840e1389e91.46fb38549baa1978bf189a170752c184.jpeg",
  "home-kitchen":
    "https://us.home-appliances.philips/cdn/shop/files/HD9867_16_00_hero_image_1946x.jpg?v=1765209118",
  groceries:
    "https://i5.walmartimages.com/seo/Tilda-Grand-Extra-Long-Grain-Rice-5Kg-Imported-from-Britain_bbfd2ee2-fb05-4545-b3f3-152f978f22ff.03dacdd9d37b1a78ced71565523f49ac.jpeg?odnHeight=768&odnWidth=768&odnBg=FFFFFF",
  "sports-fitness":
    "https://www.manduka.com/cdn/shop/files/PRO-111011020-MATS-SS20-Thunder-01.jpg?v=1768250592&width=871",
  "baby-products":
    "https://m.media-amazon.com/images/I/71ZwAG6vB7L._AC_SL1500_.jpg",
};

/** Fallback for a category the map does not know about. */
export const CATEGORY_IMAGE_FALLBACK =
  "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80";

export function categoryImage(slug: string | null | undefined, provided?: string | null): string {
  if (provided) return provided;
  if (slug && CATEGORY_IMAGES[slug]) return CATEGORY_IMAGES[slug];
  return CATEGORY_IMAGE_FALLBACK;
}
