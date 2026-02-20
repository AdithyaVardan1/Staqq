import os
import datetime

def get_modified_files(root_dir, days=2):
    start_date = datetime.datetime.now() - datetime.timedelta(days=days)
    exclude_dirs = {'.git', 'node_modules', '.next', 'dist', 'build'}
    
    modified_files = []
    
    for root, dirs, files in os.walk(root_dir):
        # Modify dirs in-place to skip excluded directories
        dirs[:] = [d for d in dirs if d not in exclude_dirs]
        
        for file in files:
            file_path = os.path.join(root, file)
            try:
                mtime = os.path.getmtime(file_path)
                mtime_dt = datetime.datetime.fromtimestamp(mtime)
                
                if mtime_dt > start_date:
                    rel_path = os.path.relpath(file_path, root_dir)
                    modified_files.append((mtime, rel_path))
            except (OSError, PermissionError):
                continue
                
    # Sort by modification time descending
    modified_files.sort(key=lambda x: x[0], reverse=True)
    
    with open("modified_files_list.txt", "w") as f:
        f.write(f"{'TIMESTAMP':<20} | {'FILE PATH'}\n")
        f.write("-" * 60 + "\n")
        for mtime, path in modified_files:
            dt_str = datetime.datetime.fromtimestamp(mtime).strftime('%Y-%m-%d %H:%M:%S')
            f.write(f"{dt_str:<20} | {path}\n")
    
    print(f"Results saved to modified_files_list.txt ({len(modified_files)} files)")

if __name__ == "__main__":
    get_modified_files(".", days=4)
