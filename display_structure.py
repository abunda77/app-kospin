import os
import fnmatch

def get_ignore_patterns(gitignore_path):
    """
    Mengambil pola-pola yang harus diabaikan dari file .gitignore
    """
    try:
        with open(gitignore_path, 'r') as f:
            lines = f.readlines()
            # Filter out comments and empty lines
            ignore_patterns = [line.strip() for line in lines if line.strip() and not line.startswith('#')]
            return ignore_patterns
    except FileNotFoundError:
        return []

def should_ignore(item_name, ignore_patterns):
    """
    Memeriksa apakah suatu item harus diabaikan berdasarkan pola dalam .gitignore
    """
    for pattern in ignore_patterns:
        # Menggunakan fnmatch untuk mendukung wildcard
        if fnmatch.fnmatch(item_name, pattern):
            return True
    return False

def display_structure(root_dir, level=0, ignore_patterns=None):
    """
    Display directory structure starting from root_dir
    dengan indentation untuk tiap level dan mengabaikan file/folder
    yang tercantum dalam .gitignore
    """
    ignore_patterns = ignore_patterns or []
    
    if level < 2:  # Limit depth to 2 levels
        for item in os.listdir(root_dir):
            if should_ignore(item, ignore_patterns):
                continue
                
            item_path = os.path.join(root_dir, item)
            
            # Print directory name
            if os.path.isdir(item_path):
                print('  ' * level + '├── ' + item + '/')
                # Recursively display contents of directory
                display_structure(item_path, level + 1, ignore_patterns)
            else:
                # Print file name
                print('  ' * level + '└── ' + item)

# Example usage
if __name__ == "__main__":
    root_dir = os.getcwd()  # Start from current directory
    print(f"Directory structure of: {root_dir}")
    print("────────────────────────────")
    
    # Dapatkan pola-pola yang harus diabaikan dari .gitignore
    ignore_patterns = get_ignore_patterns('.gitignore')
    display_structure(root_dir, ignore_patterns=ignore_patterns)
