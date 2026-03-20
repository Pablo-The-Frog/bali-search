import tkinter as tk
from tkinter.colorchooser import askcolor

class BaliDraw:
    def __init__(self, root):
        self.root = root
        self.root.title("Bali'n Draw")
        self.color = 'black'

        self.canvas = tk.Canvas(root, bg='white', width=800, height=600)
        self.canvas.pack()

        self.canvas.bind('<B1-Motion>', self.draw)
        self.last_x, self.last_y = None, None

        # Buttons
        btn_frame = tk.Frame(root)
        btn_frame.pack()

        tk.Button(btn_frame, text='Clear', command=self.clear).pack(side='left')
        tk.Button(btn_frame, text='Color', command=self.choose_color).pack(side='left')

    def draw(self, event):
        if self.last_x and self.last_y:
            self.canvas.create_line(self.last_x, self.last_y, event.x, event.y,
                                    fill=self.color, width=3, capstyle=tk.ROUND, smooth=True)
        self.last_x, self.last_y = event.x, event.y

    def clear(self):
        self.canvas.delete('all')
        self.last_x, self.last_y = None, None

    def choose_color(self):
        color = askcolor(color=self.color)[1]
        if color:
            self.color = color

def main():
    root = tk.Tk()
    app = BaliDraw(root)
    root.mainloop()

if __name__ == '__main__':
    main()
