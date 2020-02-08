from PIL import Image
import argparse
import json


def encode_board(outfile, data):
    """
    Save a list of tiles into a .json
    """
    with open(outfile, "w") as f:
        json.dump(data, f)


def main(args):
    """
    Parse a given image file into a tile board

    Any black pixels will be stored as regular tiles
    Any other pixels will be ignored
    """
    # Load the image
    image = Image.open(args.filename).convert("RGB")
    data = image.load()
    tiles = []

    # Store any black pixels as tiles
    for yy in range(image.height):
        for xx in range(image.width):
            pixel = data[xx, yy]
            if pixel == (0, 0, 0):
                tiles.append([xx, yy])

    # Save the board to a .json file
    encode_board(args.output, tiles)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Provision a simple image into a tileset format"
    )
    parser.add_argument("filename", help="File path to open")
    parser.add_argument(
        "--output", help="Output file to save board", default="board.json"
    )

    args = parser.parse_args()
    main(args)
