# Media upload checklist

Every file below is already referenced by the site. Upload the file at the
exact name listed and it appears automatically — until then the page shows a
dashed placeholder printed with the filename.

## Homepage (`index.html`)

### #GECOMO shoppable video strip (vertical 9:16 clips)
| File | Slot | Product linked |
|---|---|---|
| `ugc1.mp4` | Video 1 | Brow Stamp |
| `ugc2.mp4` | Video 2 | Brow Pencil |
| `ugc3.mp4` | Video 3 | Brow Stamp |
| `ugc4.mp4` | Video 4 | Brow Pencil |
| `ugc5.mp4` | Video 5 | Brow Stamp |

### Review photos (landscape ~4:3)
| File | Review card |
|---|---|
| `home-review1.jpg` | Danielle R. |
| `home-review2.jpg` | Rachel M. |
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
