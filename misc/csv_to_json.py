import json

# Input and output file paths
input_file = "grassmannian_CI_hodge_numbers.txt"  # Replace with your file path
output_file = "grassmannian_CI_hodge_numbers.json"

# Initialize the dictionary
data_dict = {}

# Parse the data file and populate the dictionary
with open(input_file, "r") as file:
    for line_number, line in enumerate(file):
        if line_number == 0:
            # Skip the header
            continue
        
        # Split the line by commas while respecting curly braces
        parts = line.strip().split("},")
        k_n_degrees = f"{parts[0]}}}"
        hodge_numbers = parts[1].strip()

        # Add to the dictionary
        data_dict[k_n_degrees] = hodge_numbers

# Save the dictionary to a JSON file
with open(output_file, "w") as json_file:
    json.dump(data_dict, json_file, indent=4)

print(f"Data successfully converted and saved to {output_file}")
