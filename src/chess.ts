/*
  find_moves(loc, type):
    in check?
    KING
      - basic moves - blocked - checked
      - castling
    PAWN
      - can we move forward
        - have we moved yet (if no x2)
      - can we take
        - can we take en passant
    KNIGHT
      - basic moves - blocked
    ROOK/BISHOP/QUEEN
      - beam search basic moves until blocked
*/
