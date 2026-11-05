import os
import glob
# Since the recent python scripts failed with exceptions, we should find the one around 04:58 which we know worked.
# the node scripts generated them locally in the root dir previously, but let's grab the one we actually made with the correct playwright script.
videos = glob.glob('/home/jules/verification/videos/*.webm')
sizes = {v: os.path.getsize(v) for v in videos}
# Print videos sorted by size
for v, s in sorted(sizes.items(), key=lambda item: item[1]):
    print(f"{v}: {s} bytes")
