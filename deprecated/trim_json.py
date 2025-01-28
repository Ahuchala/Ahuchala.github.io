# this is just to trim redundant info in the hodge CI json file

import json
import math

# Load the JSON file
def load_json(file_path):
    with open(file_path, 'r') as f:
        return json.load(f)

# Save the trimmed JSON back to a file
def save_json(data, file_path):
    with open(file_path, 'w') as f:
        json.dump(data, f, indent=4)

# Trim the unneeded extra terms in the JSON file
def trim_hodge_json(data):
    trimmed_data = {}

    for key, value in data.items():
        # Extract k, n, and degrees from the key
        key_parts = key.split(",")
        k = int(key_parts[0])
        n = int(key_parts[1])
        degrees = key_parts[2]

        # Convert the value to a list of integers
        hodge_values = list(map(int, value.strip("{} ").split(",")))

        # Calculate the dimension a = k(n-k) - r, where r is len(degrees)
        num_degrees = len(degrees.strip("{} ").split(","))
        a = k * (n - k) - num_degrees

        # Determine how many terms to keep
        if a % 2 == 0:
            # Even case
            keep_length = a // 2 + 1
        else:
            # Odd case
            keep_length = (a + 1) // 2

        # Trim the hodge values to the required length
        trimmed_hodge_values = hodge_values[:keep_length]

        # Reconstruct the JSON value as a string
        trimmed_data[key] = "{" + ", ".join(map(str, trimmed_hodge_values)) + "}"

    return trimmed_data

# Main script to load, trim, and save the JSON file
def main():
    input_file = "grassmannian_CI_hodge_numbers.json"  # Update with your file path
    output_file = "trimmed_grassmannian_CI_hodge_numbers.json"

    # Load the original JSON file
    data = load_json(input_file)

    # Trim the JSON data
    trimmed_data = trim_hodge_json(data)

    # Save the trimmed JSON file
    save_json(trimmed_data, output_file)
    print(f"Trimmed JSON saved to {output_file}")

if __name__ == "__main__":
    main()
