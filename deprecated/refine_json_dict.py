import json

# Load the original JSON file
input_file = "trimmed_grassmannian_CI_hodge_numbers.json"
output_file = "organized_grassmannian_CI_hodge_numbers.json"

with open(input_file, "r") as file:
    data = json.load(file)

# Organize the dictionary
organized_data = {}
for key, value in data.items():
    k_n, degrees = key.split(",", maxsplit=2)[:2], key.split(",", maxsplit=2)[2]
    k_n = ",".join(k_n)
    
    if k_n not in organized_data:
        organized_data[k_n] = {}
    organized_data[k_n][degrees] = value

# Save the organized dictionary
with open(output_file, "w") as file:
    json.dump(organized_data, file, indent=4)

print(f"Organized JSON saved to {output_file}")
