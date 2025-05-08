1. Virtual Environment
   1. Create a venv:
      - python -m venv venv
   2. Start venv:
      - sourve venv/bin/activate
   3. Install dependencies:
      pip install -r requirements.txt

TODO:
Feature:

- [ ] Implement image processing (grayscale, blur, canny, edge_closing)
- [ ] Export to DXF

UI:

- [ ] Fix the drawer size inputs

Bugs:

- [-] Fix rotation and mirroring, so python processed the image correctly
- [ ] The width and height of the image is hardcoaded at 1280x720px
- [-] Center of axis when rotated is top right, instead of top left, hence issue
- [ ] Fix mirroring issue in py
