const editedSequences = [
    { id: "A000755", name: 
    /* html */`
No-3-in-line problem on $n \\times n$ grid: total number of ways of placing $2n$ points on $n \\times n$ grid so no 3 are in a line. No symmetries are taken into account.` },
    { id: "A000983", name: 
    /* html */`
Size of minimal binary covering code of length n and covering radius 1.` },
    { id: "A001197", name: 
    /* html */`
Zarankiewicz's problem $k_2(n)$.` },
    { id: "A001839", name: 
    /* html */`
The coding-theoretic function $A(n,4,3$).` },
    { id: "A002564", name: 
    /* html */`
Number of different ways one can attack all squares on an $n \\times n$ chessboard using the minimum number of queens.` },
    { id: "A003192", name: 
    /* html */`
Length of uncrossed knight's path on an $n \\times n$ board.` },
    { id: "A004035", name: 
    /* html */`    
        The coding-theoretic function $A(n,4,5)$.
    ` },
    { id: "A004056", name: 
    /* html */`
The coding-theoretic function $A(n,14,12)$.` },
    { id: "A005864", name: 
    /* html */`
The coding-theoretic function $A(n,4)$.` },
    { id: "A006075", name: 
    /* html */`
Minimal number of knights needed to cover an $n \\times n$ board.` },
    { id: "A065825", name: 
    /* html */`
Smallest $k$ such that $n$ numbers may be picked in $\\{1,...,k\\}$ with no three terms in arithmetic progression.` },
    { id: "A070214", name: 
    /* html */`
Maximal number of occupied cells in all monotonic matrices of order n.` },
    { id: "A072567", name: 
    /* html */`
A variant of Zarankiewicz problem: maximal number of 1s in $n \\times n$ 01-matrix with no four 1s forming a rectangle.` },
    { id: "A075324", name: 
    /* html */`
Independent domination number for queens' graph $Q(n)$.` },
    { id: "A075458", name: 
    /* html */`
Domination number for queens' graph $Q(n)$.` },
    { id: "A087329", name: 
    /* html */`
Independence numbers for $KT_4$ knight on hexagonal board.` },
    { id: "A140859", name: 
    /* html */`
Border-domination number of queen graph for $n \\times n$ board.` },
    { id: "A157416", name: 
    /* html */`
Length of maximal uncrossed cycle of knight moves on $n \\times n$ board.` },
    { id: "A190394", name: 
    /* html */`
Maximum number of nonattacking nightriders on an $n \\times n$ board.` },
    { id: "A219760", name: 
    /* html */`
Martin Gardner's minimal no-3-in-a-line problem.` },
    { id: "A247181", name: 
    /* html */`
Total domination number of the $n$-hypercube graph.` },
    { id: "A250000", name: 
    /* html */`
Peaceable coexisting armies of queens: the maximum number $m$ such that $m$ white queens and $m$ black queens can coexist on an $n \\times n$ chessboard without attacking each other.` },
    { id: "A251419", name: 
    /* html */`
Domination number of the $n$-triangle grid graph $TG_n$ having $n$ vertices along each side.` },
    { id: "A251532", name: 
    /* html */`
Independence number of the $n$-triangular honeycomb obtuse knight graph.` },
    { id: "A251534", name: 
    /* html */`
Domination number of the $n$-triangular honeycomb obtuse knight graph.` },
    // { id: "A261752", name: 
    // /* html */`
// Minimum number of knights on an $n \\times n$ chessboard such that every square is attacked.` },
    { id: "A264041", name: 
    /* html */`
a(n) is the maximum number of diagonals that can be placed in an $n \\times n$ grid made up of $1 \\times 1$ unit squares when diagonals are placed in the unit squares in such a way that no two diagonals may cross or intersect at an endpoint.` },
    { id: "A269706", name: 
    /* html */`
Size of a minimum dominating set (domination number) in an $n \\times n \\times  n$ grid.` },
    { id: "A272651", name: 
    /* html */`
The no-3-in-line problem: maximal number of points from an $n \\times n$ square grid so that no three lie on a line.` },
    { id: "A274933", name: 
    /* html */`
Maximal number of non-attacking queens on a quarter chessboard containing $n^2$ squares.` },
    { id: "A277433", name: 
    /* html */`
Martin Gardner's minimal no-3-in-a-line problem, all slopes version.` },
    { id: "A279402", name: 
    /* html */`
Domination number for queen graph on an $n \\times n$ toroidal board.` },
    { id: "A279404", name: 
    /* html */`
Independent domination number for queens' graph on an $n \\times n$ toroidal board.` },
    { id: "A279405", name: 
    /* html */`
Peaceable coexisting armies of queens on a torus: the maximum number m such that m white queens and m black queens can coexist on an $n \\times n$ toroidal chessboard without attacking each other.` },
    { id: "A279407", name: 
    /* html */`
Domination number for knight graph on an $n \\times n$ toroidal board.` },
    { id: "A286882", name: 
    /* html */`
Number of minimal dominating sets in the $n \\times n$ knight graph.` },
    { id: "A287864", name: 
    /* html */`
Consider a symmetric pyramid-shaped chessboard with rows of squares of lengths $n, n-2, n-4, ...$, ending with either 2 or 1 squares; $a(n)$ is the maximal number of mutually non-attacking queens that can be placed on this board.` },
    { id: "A287867", name: 
    /* html */`
a(n) = floor(n/2) - A287864(n).` },
    { id: "A302401", name: 
    /* html */`
Total domination number of the $n \\times n$ king graph.` },
    { id: "A302486", name: 
    /* html */`
Total domination number of the n-triangular grid graph.` },
    { id: "A303003", name: 
    /* html */`
Total domination number of the $n \\times n$ queen graph.` },
    { id: "A308632", name: 
    /* html */`
Largest aggressor for the maximum number of peaceable coexisting queens as given in A250000.` },
    { id: "A328283", name: 
    /* html */`
The maximum number $m$ such that $m$ white, $m$ black and $m$ red queens can coexist on an $n \\times n$ chessboard without attacking each other.` },
    { id: "A335445", name: 
    /* html */`
Maximum number of rooks within an $n \\times n$ chessboard, where each rook has a path to an edge.` },
    { id: "A342374", name: 
    /* html */`
Total domination number of the $n$-triangular honeycomb obtuse knight graph.` },
    { id: "A342576", name: 
    /* html */`
Independent domination number for knight graph on an $n \\times n$ board.` },
    { id: "A352241", name: 
    /* html */`
Maximal number of nonattacking black-square queens on an $n \\times n$ chessboard.` },
    { id: "A352426", name: 
    /* html */`
Maximal number of nonattacking white-square queens on an $n \\times n$ chessboard.` },
    { id: "A364665", name: 
    /* html */`
Lower independence number of the $n$-triangular honeycomb obtuse knight graph.` },
    { id: "A364666", name: 
    /* html */`
Lower independence number of the $n \\times n \\times n$ grid graph.` },
    { id: "A364667", name: 
    /* html */`
Lower independence number of the $n$-diagonal intersection graph.` },
    { id: "A364669", name: 
    /* html */`
Lower independence number of the hypercube graph $Q_n$.` }
];

const authoredSequences = [
    { id: "A351664", name: 
    /* html */`
Discriminants of imaginary quadratic fields with class number 26 (negated).` },
    { id: "A351665", name: 
    /* html */`
Discriminants of imaginary quadratic fields with class number 27 (negated).` },
    { id: "A351666", name: 
    /* html */`
Discriminants of imaginary quadratic fields with class number 28 (negated).` },
    { id: "A351667", name: 
    /* html */`
Discriminants of imaginary quadratic fields with class number 29 (negated).` },
    { id: "A351668", name: 
    /* html */`
Discriminants of imaginary quadratic fields with class number 30 (negated).` },
    { id: "A351669", name: 
    /* html */`
Discriminants of imaginary quadratic fields with class number 31 (negated).` },
    { id: "A351670", name: 
    /* html */`
Discriminants of imaginary quadratic fields with class number 32 (negated).` },
    { id: "A351671", name: 
    /* html */`
Discriminants of imaginary quadratic fields with class number 33 (negated).` },
    { id: "A351672", name: 
    /* html */`
Discriminants of imaginary quadratic fields with class number 34 (negated).` },
    { id: "A351673", name: 
    /* html */`
Discriminants of imaginary quadratic fields with class number 35 (negated).` },
    { id: "A351674", name: 
    /* html */`
Discriminants of imaginary quadratic fields with class number 36 (negated).` },
    { id: "A351675", name: 
    /* html */`
Discriminants of imaginary quadratic fields with class number 37 (negated).` },
    { id: "A351676", name: 
    /* html */`
Discriminants of imaginary quadratic fields with class number 38 (negated).` },
    { id: "A351677", name: 
    /* html */`
Discriminants of imaginary quadratic fields with class number 39 (negated).` },
    { id: "A351678", name: 
    /* html */`
Discriminants of imaginary quadratic fields with class number 40 (negated).` },
    { id: "A351679", name: 
    /* html */`
Discriminants of imaginary quadratic fields with class number 41 (negated).` },
    { id: "A351680", name: 
    /* html */`
Discriminants of imaginary quadratic fields with class number 42 (negated).` },
    { id: "A362875", name: 
    /* html */`
Theta series of 15-dimensional lattice Kappa_15.` },
    { id: "A362876", name: 
    /* html */`
Theta series of 16-dimensional lattice Kappa_16.` },
    { id: "A362877", name: 
    /* html */`
Theta series of 17-dimensional lattice Kappa_17.` },
    { id: "A362878", name: 
    /* html */`
Theta series of 18-dimensional lattice Kappa_18.` },
    { id: "A362879", name: 
    /* html */`
Theta series of 19-dimensional lattice Kappa_19.` },
    { id: "A362880", name: 
    /* html */`
Theta series of 20-dimensional lattice Kappa_20.` },
    { id: "A363147", name: 
    /* html */`
Primes $q \\equiv 1 \\text{ mod } 4$ such that there is at least one equivalence class of quaternary quadratic forms of discriminant $q$ not representing 2.` },
    { id: "A363148", name: 
    /* html */`
$a(n)$ gives the number of equivalence classes of quaternary quadratic forms of discriminant A363147(n) not representing 2.` },
    { id: "A339248", name: 
    /* html */`
List of dimensions for which there exist several non-isomorphic irreducible representations of G2.` },
    { id: "A339249", name: 
    /* html */`
List of dimensions for which there exist several non-isomorphic irreducible representations of F4.` },
    { id: "A339250", name: 
    /* html */`
List of dimensions for which there exist several non-isomorphic irreducible representations of E6.` },
    { id: "A339251", name: 
    /* html */`
List of dimensions for which there exist several non-isomorphic irreducible representations of E7.` },
    { id: "A343266", name: 
    /* html */`
List of dimensions for which there exist 8 or more non-isomorphic irreducible representations of E6.` },
    { id: "A345657", name: 
    /* html */`
Theta series of the canonical laminated lattice LAMBDA_26.` },
    { id: "A345658", name: 
    /* html */`
Theta series of the canonical laminated lattice LAMBDA_27.` },
    { id: "A345659", name: 
    /* html */`
Theta series of the canonical laminated lattice LAMBDA_28.` },
    { id: "A345660", name: 
    /* html */`
Theta series of the canonical laminated lattice LAMBDA_29.` },
    { id: "A345661", name: 
    /* html */`
Theta series of the canonical laminated lattice LAMBDA_30.` },
    { id: "A345662", name: 
    /* html */`
Theta series of the canonical laminated lattice LAMBDA_31.` },
    { id: "A352095", name: 
    /* html */`
Dimension of the space of Siegel cusp forms of genus 3 and weight $2n$.` },
];

const favoriteSequences = [
    { id: "A181746", name: 
    /* html */`
List of dimensions for which there exist several non-isomorphic irreducible representations of E8.` },
    { id: "A343266", name: 
    /* html */`
List of dimensions for which there exist 8 or more non-isomorphic irreducible representations of E6.` }
];

