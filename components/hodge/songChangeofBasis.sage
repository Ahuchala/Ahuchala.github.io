K11.<z11> = CyclotomicField(11)
c = z11 + z11^3 + z11^4 + z11^5 + z11^9
C = -1 - c

a5 = matrix(K11, [[0,1,0,0,0],[1,0,0,0,0],[0,0,0,0,1],[1,-1,c,1,-c],[0,0,1,0,0]])
b5 = matrix(K11, [[0,0,0,1,0],[0,0,1,0,0],[0,-1,-1,0,0],[-C,0,0,-1,-c-2*C],[1,0,0,-1,1]])

from itertools import combinations
basis5 = list(combinations(range(5), 2))
basis10 = list(combinations(range(10), 3))

def ext2(M):
    E = matrix(K11, 10, 10)
    for i,(r1,r2) in enumerate(basis5):
        for j,(c1,c2) in enumerate(basis5):
            E[i,j] = M[r1,c1]*M[r2,c2] - M[r1,c2]*M[r2,c1]
    return E

a10 = ext2(a5)
b10 = ext2(b5)
P10 = a10 * b10

song_eigs_10 = [10, 2, 7, 8, 6, 5, 1, 9, 4, 3]
C10 = matrix(K11, [(P10 - z11^k * matrix.identity(K11,10)).right_kernel().basis()[0]
                   for k in song_eigs_10]).transpose()
Cinv10 = C10.inverse()

# Compute ext^3 action matrices
def ext3_matrix(M):
    E = matrix(K11, 120, 120)
    for i,I in enumerate(basis10):
        for j,J in enumerate(basis10):
            E[i,j] = matrix(K11, [[M[I[r],J[c]] for c in range(3)] for r in range(3)]).determinant()
    return E

E3a = ext3_matrix(a10)
E3b = ext3_matrix(b10)

# Find invariant vector
A = (E3a - matrix.identity(K11, 120)).stack(E3b - matrix.identity(K11, 120))
N = A.right_kernel()
assert N.dimension() == 1
v = vector(K11, N.basis()[0])

# Transform to Song's basis
EXT_C10inv = ext3_matrix(Cinv10)
v_song = EXT_C10inv * v
nonzero = [(basis10[i], v_song[i]) for i in range(120) if v_song[i] != 0]
assert len(nonzero) == 10

# Compute nu_i^33 from inverse exponent matrix
song_signs = {(0,2,5):1,(1,3,6):1,(2,4,7):1,(0,3,8):-1,(1,4,9):-1,
              (0,7,9):-1,(1,5,8):1,(2,6,9):1,(3,5,7):-1,(4,6,8):-1}
terms = [(0,2,5),(1,3,6),(2,4,7),(0,3,8),(1,4,9),(0,7,9),(1,5,8),(2,6,9),(3,5,7),(4,6,8)]
nonzero_dict = {idx: val for idx,val in nonzero}
targets = [K11(song_signs[t]) / nonzero_dict[t] for t in terms]

exp_mat = matrix(QQ, 10, 10)
for row,(i,j,k) in enumerate(terms):
    exp_mat[row,i] += 1; exp_mat[row,j] += 1; exp_mat[row,k] += 1
A_mat = 33 * exp_mat.inverse()

nu33 = [prod(targets[j]^int(A_mat[i,j]) for j in range(10)) for i in range(10)]

# Adjoin 33rd roots
R.<x> = K11[]
# Find the extension needed
nu33_minpolys = [(x^33 - v).factor() for v in nu33]

# Build extension and solve
# Each nu_i^33 is in K11, adjoin alpha_i with alpha_i^33 = nu33[i]
# For verification, work symbolically: check that the diagonal scaling works
# by verifying nu_i * nu_j * nu_k * c_ijk = sign_ijk using nu_i^33

# Verify consistency: (nu_i*nu_j*nu_k)^33 = (sign/c)^33 should hold in K11
print("Verifying nu_i^33 consistency:")
for (i,j,k),sign in song_signs.items():
    lhs = nu33[i] * nu33[j] * nu33[k]
    rhs = (K11(sign) / nonzero_dict[(i,j,k)])^33
    print(f"[{i},{j},{k}]: {lhs == rhs}")

print("\nC10 (change of basis V10 -> Song's basis):")
print(C10)

print("\nnu_i^33:")
for i,v in enumerate(nu33):
    print(f"nu_{i}^33 =", v)

print("\nThe isomorphism phi: V10 -> V10 is D * C10^-1")
print("where D = diag(nu_0,...,nu_9) with nu_i = (nu_i^33)^(1/33)")
print("defined over Q(zeta_11, nu_0^(1/33), ..., nu_9^(1/33))")