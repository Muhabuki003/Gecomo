# Media upload checklist

Every file below is already referenced by the site. Upload the file at the
exact name listed and it appears automatically — until then the page shows a
dashed placeholder printed with the filename.

## Homepage (`index.html`) — ILIA-style layout

### Bestsellers rail (product cards, portrait 4:5)
| File | Card |
|---|---|
| *(live from Shopify)* | Double Seal Brow Stamp Kit |
| *(live from Shopify)* | Waterproof Brow Pencil |
| `product-duo.jpg` | The Brow Duo — Stamp + Pencil set |
| `cat-playbook.jpg` | The Brow Playbook (free gift) — also shown in the free-gift offer box on `stamp.html` and `pencil.html` (uploaded ✓) |

### Shop by Category tiles (portrait 3:4)
| File | Tile |
|---|---|
| `cat-stamps.jpg` | Brow Stamps |
| `cat-pencils.jpg` | Brow Pencils |
| `cat-sets.jpg` | Sets + Duos |
| `cat-playbook.jpg` | The Playbook |

### New Arrivals editorial band (wide 21:9 desktop / 4:5 mobile crop)
| File | Slot |
|---|---|
| `home-launch.jpg` | Full-width launch image (uploaded ✓) |

### Find My Shade band (square 1:1)
| File | Slot |
|---|---|
| `home-shade.jpg` | Shade-finder split-band image |

### #GECOMO shoppable video strip (vertical 9:16 clips)
| File | Slot | Product linked |
|---|---|---|
| `ugc1.mp4` | Video (uploaded ✓) | Brow Stamp |
| `ugc2.mp4` | Video (uploaded ✓) | Brow Pencil |

### Review photos (landscape ~4:3)
| File | Review card |
|---|---|
| `home-review1.jpg` | Danielle R. (uploaded ✓) |
| `home-review2.jpg` | Rachel M. (uploaded ✓) |
| `home-review3.jpg` | Maya T. |

## Brow Stamp page (`stamp.html`)
| File | Review card |
|---|---|
| `stamp-review1.jpg` | Danielle R. |
| `stamp-review2.jpg` | Maya T. |
| `stamp-review3.jpg` | Priya K. |
| `stamp-review4.jpg` | Jordan S. |

## Brow Pencil page (`pencil.html`)
| File | Review card |
|---|---|
| `pencil-review1.jpg` | Rachel M. |
| `pencil-review2.jpg` | Sofia L. |
| `pencil-review3.jpg` | Nina P. |
| `pencil-review4.jpg` | Amara K. |

Notes:
- Videos autoplay muted and loop; keep them short (5–15s) and compressed.
- To swap a photo for a video in a review, change the `media:` path in that
  page's `REVIEWS` array and the `<img>` to a `<video>` in the renderer.
