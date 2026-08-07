import gzip
import struct
from pathlib import Path

import torch
from torch import nn
from torch.utils.data import DataLoader, TensorDataset

from model import DigitCNN


BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "digit_model.pth"

BATCH_SIZE = 64
EPOCHS = 10
LEARNING_RATE = 0.001


def read_images(path):
    """读取 MNIST 的 IDX 压缩图片文件。"""
    with gzip.open(path, "rb") as file:
        magic, count, rows, columns = struct.unpack(">IIII", file.read(16))
        if magic != 2051:
            raise ValueError(f"图片文件格式不正确：{path.name}")
        data = file.read()

    images = torch.frombuffer(bytearray(data), dtype=torch.uint8)
    images = images.reshape(count, 1, rows, columns).float() / 255.0
    return (images - 0.1307) / 0.3081


def read_labels(path):
    """读取 MNIST 的 IDX 压缩标签文件。"""
    with gzip.open(path, "rb") as file:
        magic, count = struct.unpack(">II", file.read(8))
        if magic != 2049:
            raise ValueError(f"标签文件格式不正确：{path.name}")
        data = file.read()

    labels = torch.frombuffer(bytearray(data), dtype=torch.uint8).long()
    if len(labels) != count:
        raise ValueError(f"标签数量不正确：{path.name}")
    return labels


def load_datasets():
    required_files = {
        "train-images-idx3-ubyte.gz": BASE_DIR / "train-images-idx3-ubyte.gz",
        "train-labels-idx1-ubyte.gz": BASE_DIR / "train-labels-idx1-ubyte.gz",
        "t10k-images-idx3-ubyte.gz": BASE_DIR / "t10k-images-idx3-ubyte.gz",
        "t10k-labels-idx1-ubyte.gz": BASE_DIR / "t10k-labels-idx1-ubyte.gz",
    }

    missing = [name for name, path in required_files.items() if not path.exists()]
    if missing:
        raise FileNotFoundError("缺少 MNIST 文件：" + ", ".join(missing))

    train_images = read_images(required_files["train-images-idx3-ubyte.gz"])
    train_labels = read_labels(required_files["train-labels-idx1-ubyte.gz"])
    test_images = read_images(required_files["t10k-images-idx3-ubyte.gz"])
    test_labels = read_labels(required_files["t10k-labels-idx1-ubyte.gz"])

    return (
        TensorDataset(train_images, train_labels),
        TensorDataset(test_images, test_labels),
    )


def evaluate(model, data_loader, device):
    model.eval()
    correct = 0
    total = 0

    with torch.no_grad():
        for images, labels in data_loader:
            images = images.to(device)
            labels = labels.to(device)
            predictions = model(images).argmax(dim=1)
            correct += (predictions == labels).sum().item()
            total += labels.size(0)

    return 100.0 * correct / total


def main():
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"使用设备：{device}")
    print("正在读取 MNIST 数据……")

    train_dataset, test_dataset = load_datasets()
    train_loader = DataLoader(train_dataset, batch_size=BATCH_SIZE, shuffle=True)
    test_loader = DataLoader(test_dataset, batch_size=BATCH_SIZE, shuffle=False)

    model = DigitCNN().to(device)
    loss_function = nn.CrossEntropyLoss()
    optimizer = torch.optim.Adam(model.parameters(), lr=LEARNING_RATE)

    for epoch in range(1, EPOCHS + 1):
        model.train()
        total_loss = 0.0

        for images, labels in train_loader:
            images = images.to(device)
            labels = labels.to(device)

            optimizer.zero_grad()
            outputs = model(images)
            loss = loss_function(outputs, labels)
            loss.backward()
            optimizer.step()

            total_loss += loss.item()

        accuracy = evaluate(model, test_loader, device)
        average_loss = total_loss / len(train_loader)
        print(
            f"第 {epoch}/{EPOCHS} 轮 "
            f"| 平均损失：{average_loss:.4f} "
            f"| 测试准确率：{accuracy:.2f}%"
        )

    torch.save(model.state_dict(), MODEL_PATH)
    print(f"训练完成，模型已保存到：{MODEL_PATH}")


if __name__ == "__main__":
    main()
