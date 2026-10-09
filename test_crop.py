from PIL import Image

bg = Image.new("RGBA", (100, 100), "blue")
sprite = Image.new("RGBA", (50, 50), "red")

# Paste so it goes outside the bounds
bg.paste(sprite, (-25, 80), sprite)

bg.save("test_crop.png")
