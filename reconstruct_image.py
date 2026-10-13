import json
from PIL import Image

config = {
  "_description": "Position (rel_x, rel_y) is relative to the background boundaries (0.0 to 1.0). Size (scale_x, scale_y) is a multiplier relative to the sprite's original size. Tilt is rotation around the center of the sprite.",
  "background": "BG_Gym_Water.png",
  "sprite": "GymLeader_Kanto_2_Misty_Water.png",
  "position": {
    "rel_x": 0.54,
    "rel_y": 0.256,
    "px_x": 972,
    "px_y": 256
  },
  "size": {
    "scale_x": 1.5045,
    "scale_y": 1.5045,
    "px_width": 665,
    "px_height": 978
  },
  "tilt": {
    "angle_deg": 54,
    "origin": "center center"
  }
}

bg_path = f"Assets/Gym/BG/{config['background']}"
sprite_path = f"Assets/Gym/GymLeaders/{config['sprite']}"

bg = Image.open(bg_path).convert('RGBA')
sprite = Image.open(sprite_path).convert('RGBA')

# Scale the sprite
new_size = (config['size']['px_width'], config['size']['px_height'])
sprite = sprite.resize(new_size, Image.Resampling.LANCZOS)

# Rotate the sprite around the center
# PIL rotate is counter-clockwise, CSS is clockwise. So rotate by -angle_deg.
# expand=True to ensure the rotated sprite is not clipped.
angle = -config['tilt']['angle_deg']
rotated_sprite = sprite.rotate(angle, resample=Image.Resampling.BICUBIC, expand=True)

# Calculate paste position
# The px_x and px_y usually correspond to the top-left of the UNROTATED scaled sprite.
# When we rotate with expand=True, the size of the image changes.
# The new top-left corner needs to be adjusted so that the center of the rotated image
# aligns with what would be the center of the unrotated image placed at (px_x, px_y).

# Center of the unrotated placed image:
center_x = config['position']['px_x'] + new_size[0] / 2.0
center_y = config['position']['px_y'] + new_size[1] / 2.0

# The rotated image has a new size
rot_w, rot_h = rotated_sprite.size

# To paste so the center aligns with (center_x, center_y):
paste_x = int(round(center_x - rot_w / 2.0))
paste_y = int(round(center_y - rot_h / 2.0))

bg.paste(rotated_sprite, (paste_x, paste_y), rotated_sprite)

bg.save('output.png')
print("Image saved to output.png")
