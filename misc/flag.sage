def q_factorial(m, t):
    """
    Compute the q-factorial [m]_t! = \prod_{i=1}^m (1-t^(2i))/(1-t^2)
    """
    prod = 1
    for i in range(1, m+1):
        prod *= (1 - t**(2*i))/(1 - t**2)
    return prod

def partial_flag_poincare(n, dims, t):
    """
    Compute the Poincaré polynomial for the partial flag variety of GL(n,C)
    corresponding to a flag 0 < V_{d_1} < V_{d_2} < ... < V_{d_r} < C^n.
    
    Input:
      n: a positive integer
      dims: a list of integers with 0 < d_1 < d_2 < ... < d_r < n
      t: a Sage variable (e.g. t)
    
    Output:
      The Poincaré polynomial (a rational function in t) where the
      nonzero Betti numbers occur only in even degrees.
      
    This uses the formula:
      P(t) = [n]_t! / ([d_1]_t! * [d_2-d_1]_t! * ... * [n-d_r]_t!)
    """
    numerator = q_factorial(n, t)
    prev = 0
    denominator = 1
    for d in dims:
        denominator *= q_factorial(d - prev, t)
        prev = d
    denominator *= q_factorial(n - prev, t)
    return numerator/denominator

# Example usage:
# Full flag variety corresponds to dims = [1,2,...,n-1]
n = 5
R.<t> = PowerSeriesRing(ZZ,4*(n+1))
full_flag = partial_flag_poincare(n, list(range(1, n)), t)
print("Full flag variety Poincaré polynomial:")
print(full_flag)

# For a partial flag, say with subspaces of dimensions 2 and 4 in C^5:
partial_flag = partial_flag_poincare(5, [2,4], t)
print("\nPartial flag variety (dims = [2,4]) Poincaré polynomial:")
print(partial_flag)
