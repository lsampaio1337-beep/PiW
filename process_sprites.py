import os
from PIL import Image

def process_sprites():
    input_dir = 'Assets/Pokemon Sprites/New Natural'
    output_dir = 'Assets/Pokemon Sprites/New Clean/Gen5'

    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    for filename in os.listdir(input_dir):
        if filename.startswith('Gen5_') and filename.endswith('.png'):
            # Calculate output filename
            # e.g., Gen5_0001_Bulbasaur.png -> 0001_Bulbasaur_clean.png
            # Gen5_0001_Bulbasaur_shiny.png -> 0001_Bulbasaur_shiny_clean.png
            base_name = filename[5:-4] # remove Gen5_ and .png
            output_filename = f"{base_name}_clean.png"

            input_path = os.path.join(input_dir, filename)
            output_path = os.path.join(output_dir, output_filename)

            img = Image.open(input_path)

            # Ensure it's in a mode with alpha channel (RGBA)
            img_rgba = img.convert('RGBA')

            # Get bounding box of non-transparent pixels
            bbox = img_rgba.getchannel('A').getbbox()

            if bbox:
                # Crop image to bounding box
                cropped_img = img_rgba.crop(bbox)

                # We save cropped image.
                # Note: keeping it RGBA if we converted it, but keeping mode P if it was P might be better?
                # Actually, usually keeping RGBA is fine for game sprites.
                # Let's save as PNG
                cropped_img.save(output_path, 'PNG')
            else:
                print(f"Warning: {filename} is completely transparent.")

if __name__ == '__main__':
    process_sprites()
