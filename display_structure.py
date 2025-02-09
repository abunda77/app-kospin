import os

def display_structure(root_dir, level=0):
    """
    Display directory structure starting from root_dir
    with indentation for each level
    """
    for item in os.listdir(root_dir):
        item_path = os.path.join(root_dir, item)
        
        # Print directory name
        if os.path.isdir(item_path):
            print('  ' * level + '├── ' + item + '/')
            # Recursively display contents of directory
            display_structure(item_path, level + 1)
        else:
            # Print file name
            print('  ' * level + '└── ' + item)

# Example usage
if __name__ == "__main__":
    root_dir = os.getcwd()  # Start from current directory
    print(f"Directory structure of: {root_dir}")
    print("────────────────────────────")
    display_structure(root_dir)
