import json
from itertools import combinations_with_replacement


MAX_DIM = 10
MAX_DEGREE = 10
MAX_NUM_HYPERSURFACES = 8

# Hodge polynomial computation
def hodge(d, n, front_part, back_part):
    n -= len(d)  # Adjust dimension for the intersections
    R.<x, y> = PowerSeriesRing(ZZ, default_prec=n + 2)
    H = (front_part * 
         (prod(((1 + x)^di - (1 + y)^di) / (x * (1 + y)^di - y * (1 + x)^di) for di in d) - 1) +
         back_part)
    # Compute only the first (n-k)+1 terms because of Hodge symmetry
    H_coefficients = H.coefficients()
    left_half = [H_coefficients.get(x^i * y^(n - i), 0) for i in range((n // 2) + 1)]
    return left_half

# Initialize dictionary to store results
results = {}

# Main loop
for n in range(1, MAX_DIM + 1):  # n from 1 to MAX_DIM
    # Precompute series ring and static terms for this `n`
    R.<x, y> = PowerSeriesRing(ZZ, default_prec=n + 2)
    front_part = 1 / ((1 + x) * (1 + y))
    back_part = 1 / (1 - x * y)

    for num_intersections in range(1, min(MAX_NUM_HYPERSURFACES, n-1) + 1):
        # Use combinations_with_replacement to ensure sorted degrees
        for degrees in combinations_with_replacement(range(1, MAX_DEGREE + 1), num_intersections):
            degrees = sorted(degrees,reverse=True)
            key = "-".join(map(str, degrees)) + f",{n}"
            results[key] = hodge(degrees, n, front_part, back_part)

# Convert all data to native Python types before saving
results = {key: [int(value) for value in values] for key, values in results.items()}

# Export the results to a JSON file
with open("hodge_numbers.json", "w") as f:
    json.dump(results, f)
