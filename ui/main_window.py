import sys

from PyQt6.QtCore import Qt
from PyQt6.QtWidgets import QApplication, QFrame, QPushButton, QVBoxLayout, QWidget


class MainWindow(QWidget):
    def __init__(self):
        super().__init__()

        self.setWindowTitle("Aligner")

        # Center x and y
        main_layout = QVBoxLayout()
        main_layout.setAlignment(Qt.AlignmentFlag.AlignCenter)

        # Center Box
        box = QFrame()
        box.setFixedSize(300, 200)
        box.setStyleSheet("background-color: #1f2335; border-radius: 20px;")

        # Inner layout of the box
        box_layout = QVBoxLayout(box)
        box_layout.setAlignment(Qt.AlignmentFlag.AlignCenter)

        # Upload button
        upload_button = QPushButton("Upload")
        upload_button.setFixedSize(120, 40)
        upload_button.setStyleSheet("font-size: 16px;")

        # Add button to box layout
        box_layout.addWidget(upload_button)

        # Add box layout to main_layout
        main_layout.addWidget(box)

        # Add layout to window
        self.setLayout(main_layout)


app = QApplication(sys.argv)
window = MainWindow()
window.show()
sys.exit(app.exec())
