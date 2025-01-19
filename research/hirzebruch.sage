import json

MAX_DIM = 10
MAX_DEGREE = 10
MAX_NUM_HYPERSURFACES = 10

def hodge(d, n):
    n -= len(d)  # Adjust dimension for the intersections
    R.<x, y> = PowerSeriesRing(ZZ, default_prec=n + 2)
    H = (1 / ((1 + x) * (1 + y)) * 
         (prod(((1 + x)^di - (1 + y)^di) / (x * (1 + y)^di - y * (1 + x)^di) for di in d) - 1) +
         1 / (1 - x * y))
    # Compute only the first (n-k)+1 terms because of Hodge symmetry
    left_half = [int(H.coefficients()[x^i * y^(n-i)] if x^i * y^(n-i) in H.coefficients() else 0) 
                 for i in range((n // 2) + 1)]
    return left_half

# Initialize dictionary to store results
results = {}

# Iterate over all possible combinations
for n in range(1, MAX_DIM+1):  # n from 1 to 10
    for num_intersections in range(1, MAX_NUM_HYPERSURFACES+1):
        for degrees in cartesian_product([range(1, MAX_DEGREE+1)] * num_intersections):  # Degrees from 1 to 10
            d = sorted(degrees, reverse=True)  # Ensure degrees are sorted and weakly decreasing
            if len(d) >= n:  # Skip codimension zero and special case len(d) == n
                continue
            key = "-".join(map(str, d)) + f",{n}"
            if key not in results:  # Avoid duplicates due to different orderings
                results[key] = hodge(d, n)

# Convert all data to native Python types before saving
results = {key: [int(value) for value in values] for key, values in results.items()}

# Export the results to a JSON file
with open("hodge_numbers.json", "w") as f:
    json.dump(results, f)
