from polynomial import Polynomial


def parse(coeff:str)->Polynomial:
    """
    _summary_

    Args:
        coeff (str): _description_

    Returns:
        Polynomial: _description_
    """
    coeff = coeff.split(',')
    if coeff[0] == 1:
        reverse = True
    return Polynomial(coeff[1:], reverse_and_copy=reverse)

def unparse(poly:Polynomial)->str:
    """
    _summary_

    Args:
        poly (Polynomial): _description_

    Returns:
        str: _description_
    """
    return str(poly)
