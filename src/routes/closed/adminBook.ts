import express, { NextFunction, Request, Response, Router } from 'express';

import { pool, validationFunctions, format } from '../../core/utilities';

import { IJwtRequest } from '../../core/models';

const adminBookRouter: Router = express.Router();

const isStringProvided = validationFunctions.isStringProvided;
const isNumberProvided = validationFunctions.isNumberProvided;

const allButId =
    'SELECT isbn13, authors, publication_year, original_title, title, rating_avg, rating_count,' +
    ' rating_1_star, rating_2_star, rating_3_star, rating_4_star, rating_5_star, image_url,' +
    ' image_small_url FROM books ';

function isValidIsbn(
    request: IJwtRequest,
    response: Response,
    next: NextFunction
) {
    if (parseInt(request.body.isbn13) >= 0) {
        next();
    } else {
        response.statusMessage = 'Invalid ISBN';
        response.status(400).send({
            message: 'Invalid ISBN, use a nonnegative number.',
        });
    }
}

function isValidYear(
    request: IJwtRequest,
    response: Response,
    next: NextFunction
) {
    const currentYear: number = new Date().getFullYear();
    if (
        isNumberProvided(request.body.publication) &&
        parseInt(request.body.publication) <= currentYear
    ) {
        next();
    } else {
        response.statusMessage = 'Invalid year';
        response.status(400).send({
            message:
                'Invalid year, use a number no greater than the current year.',
        });
    }
}

function isValidAvg(
    request: IJwtRequest,
    response: Response,
    next: NextFunction
) {
    if (
        (parseFloat(request.body.average) >= 0 &&
            parseFloat(request.body.average) <= 5) ||
        request.body.average == null
    ) {
        next();
    } else {
        response.statusMessage = 'Invalid average rating';
        response.status(400).send({
            message: 'Invalid average rating, use a decimal number 0-5.',
        });
    }
}

function isValidCount(
    request: IJwtRequest,
    response: Response,
    next: NextFunction
) {
    if (parseInt(request.body.count) >= 0 || request.body.count == null) {
        next();
    } else {
        response.statusMessage = 'Invalid total rating count';
        response.status(400).send({
            message: 'Invalid total rating count, use a nonnegative number.',
        });
    }
}

function isValidStars(
    request: IJwtRequest,
    response: Response,
    next: NextFunction
) {
    let rating1 = parseInt(request.body.rating_1 ?? 0);
    rating1 = request.body.rating_1 === '' ? 0 : rating1;

    let rating2 = parseInt(request.body.rating_2 ?? 0);
    rating2 = request.body.rating_2 === '' ? 0 : rating2;

    let rating3 = parseInt(request.body.rating_3 ?? 0);
    rating3 = request.body.rating_3 === '' ? 0 : rating3;

    let rating4 = parseInt(request.body.rating_4 ?? 0);
    rating4 = request.body.rating_4 === '' ? 0 : rating4;

    let rating5 = parseInt(request.body.rating_5 ?? 0);
    rating5 = request.body.rating_5 === '' ? 0 : rating5;

    if (
        rating1 >= 0 &&
        rating2 >= 0 &&
        rating3 >= 0 &&
        rating4 >= 0 &&
        rating5 >= 0
    ) {
        next();
    } else {
        response.statusMessage = 'Invalid star ratings';
        response.status(400).send({
            message: 'Invalid star ratings, use nonnegative numbers.',
        });
    }
}


/**
 * @api {delete} /adminBook/author Request to remove books by author
 *
 * @apiDescription Request to remove all books with the specified <code>author</code>
 *
 * @apiName DeleteBooksAuthor
 * @apiGroup AdminBook
 *
 * @apiQuery {String} author The author's name
 *
 * @apiSuccess {IBook[]} entries Removed entries with the following format:
 * "isbn13: <code>isbn13</code>,
 * authors: <code>authors</code>,
 * publication: <code>publication_year</code>,
 * original_title: <code>original_title</code>,
 * title: <code>title</code>,
 * ratings: {
 *     average: <code>rating_avg</code>,
 *     count: <code>rating_count</code>,
 *     rating_1: <code>rating_1_star</code>,
 *     rating_2: <code>rating_2_star</code>,
 *     rating_3: <code>rating_3_star</code>,
 *     rating_4: <code>rating_4_star</code>,
 *     rating_5: <code>rating_5_star</code>
 * },
 * icons: {
 *     large: <code>image_url</code>,
 *     small: <code>image_small_url</code>
 * }"
 *
 * @apiError (400: Missing information) {String} message "Missing data, refer to documentation."
 * @apiError (404: No books found) {String} message "No books with this author were found to delete."
 */
adminBookRouter.delete(
    '/author',
    (request: IJwtRequest, response: Response, next: NextFunction) => {
        if (isStringProvided(request.query.author)) {
            next();
        } else {
            response.statusMessage = 'Missing information';
            response.status(400).send({
                message: 'Missing data, refer to documentation.',
            });
        }
    },
    (request: IJwtRequest, response: Response) => {
        const query = 'DELETE FROM books WHERE authors LIKE $1 RETURNING *';
        const values = [`%${request.query.author}%`];

        pool.query(query, values)
            .then((result) => {
                if (result.rowCount > 0) {
                    response.status(200).send({
                        entries: result.rows.map(format),
                    });
                } else {
                    response.statusMessage = 'No books found';
                    response.status(404).send({
                        message:
                            'No books with this author were found to delete.',
                    });
                }
            })
            .catch(() => {
                response.status(500).send({
                    message: 'Server error - contact support',
                });
            });
    }
);
//Max start #####################
/**
 * @api {delete} /adminBook/isbn/:isbn Request to remove books by ISBN number
 *
 * @apiDescription Request to remove all books with the specified <code>isbn13</code>
 *
 * @apiName DeleteBooksByISBN
 * @apiGroup AdminBook
 *
 * @apiParam {Number} isbn ISBN13 of the book
 *
 * @apiSuccess (Success 201) {IBook} entry The removed book:
 * "isbn13: <code>isbn13</code>,
 * authors: <code>authors</code>,
 * publication: <code>publication_year</code>,
 * original_title: <code>original_title</code>,
 * title: <code>title</code>,
 * ratings: {
 *     average: <code>rating_avg</code>,
 *     count: <code>rating_count</code>,
 *     rating_1: <code>rating_1_star</code>,
 *     rating_2: <code>rating_2_star</code>,
 *     rating_3: <code>rating_3_star</code>,
 *     rating_4: <code>rating_4_star</code>,
 *     rating_5: <code>rating_5_star</code>
 * },
 * icons: {
 *     large: <code>image_url</code>,
 *     small: <code>image_small_url</code>
 * }"
 *
 * @apiError (400: Invalid ISBN) {String} message "Invalid ISBN, use a nonnegative number."
 * @apiError (404: ISBN number not found in database) {String} message "ISBN number not found in database."
 */

adminBookRouter.delete(
    '/isbn/:isbn',
    (request: IJwtRequest, response: Response, next: NextFunction) => {
        if (parseInt(request.params.isbn) >= 0) {
            next();
        } else {
            response.statusMessage = 'Invalid ISBN';
            response.status(400).send({
                message: 'Invalid ISBN, use a nonnegative number.',
            });
        }
    },
    (request: IJwtRequest, response: Response) => {
        const query = 'DELETE FROM books WHERE isbn13 = $1 RETURNING *';
        const values = [request.params.isbn];

        pool.query(query, values)
            .then((result) => {
                if (result.rowCount > 0) {
                    response.status(200).send({
                        entries: result.rows.map(format),
                    });
                } else {
                    response.statusMessage =
                        'ISBN Number not found in database';
                    response.status(404).send({
                        message: 'ISBN Number not found in database',
                    });
                }
            })
            .catch(() => {
                response.status(500).send({
                    message: 'Server error - contact support',
                });
            });
    }
);
//max end #############

//Ryan start ###################

/**
 * @api {put} /adminBook/changeValues Request to change various values for a book.
 *
 * @apiDescription Request to change various values of a book with author name and book title.
 *
 * @apiName UpdateBooks
 * @apiGroup AdminBook
 *
 * @apiBody {String} author Author's name, required
 * @apiBody {String} title Book title, required
 * @apiBody {String} new_title The new title of book, optional
 * @apiBody {Number} new_year The new publication year of book, optional
 * @apiBody {String} new_author The new author of book, optional
 * @apiBody {Number} new_isbn The new isbn of book, optional
 *
 * @apiSuccess (Success 201) {IBook} entry The book with updated values:
 * "isbn13: <code>isbn13</code>,
 * authors: <code>authors</code>,
 * publication: <code>publication_year</code>,
 * original_title: <code>original_title</code>,
 * title: <code>title</code>,
 * ratings: {
 *     average: <code>rating_avg</code>,
 *     count: <code>rating_count</code>,
 *     rating_1: <code>rating_1_star</code>,
 *     rating_2: <code>rating_2_star</code>,
 *     rating_3: <code>rating_3_star</code>,
 *     rating_4: <code>rating_4_star</code>,
 *     rating_5: <code>rating_5_star</code>
 * },
 * icons: {
 *     large: <code>image_url</code>,
 *     small: <code>image_small_url</code>
 * }"
 * 
 * @apiError (400: Missing/Bad information) {String} message "Missing or bad information, see documentation."
 * @apiError (400: No valid update values provided) {String} message "No valid update values were passed."
 * 
 * @apiError (404: No book found with that combination of author and title) {String} message "No book found with given author and title."
 * @apiError (400: Book already exists) {String} message "Book already exists in database."
 */
adminBookRouter.put(
    '/changeValues',
    //validate request body
    (request: IJwtRequest, response: Response, next: NextFunction) => {
        if (
            isStringProvided(request.body.author) &&
            isStringProvided(request.body.title) &&
            (isStringProvided(request.body.new_title) ||
                request.body.new_title == null) &&
            (isNumberProvided(request.body.new_year) ||
                request.body.new_year == null) &&
            (isNumberProvided(request.body.new_isbn) ||
                request.body.new_isbn == null) &&
            (isStringProvided(request.body.new_author) ||
                request.body.new_author == null)
        ) {
            next();
        } else {
            response.statusMessage = 'Missing/Bad information';
            response.status(400).send({
                message: 'Missing or bad information, see documentation.',
            });
        }
    },

    (request: IJwtRequest, response: Response) => {
        let counter = 0;
        let cols = '';
        const values = [];
        if (request.body.new_title != null) {
            counter++;
            cols += 'title = $' + counter + ', ';
            values.push(request.body.new_title);
        }
        if (request.body.new_author != null) {
            counter++;
            cols += 'authors = $' + counter + ', ';
            values.push(request.body.new_author);
        }
        if (request.body.new_isbn != null) {
            counter++;
            cols += 'isbn13 = $' + counter + ', ';
            values.push(request.body.new_isbn);
        }
        if (request.body.new_year != null) {
            counter++;
            cols += 'publication_year = $' + counter + ', ';
            values.push(request.body.new_year);
        }
        if (counter == 0) {
            response.statusMessage = 'No valid update values provided';
            response.status(400).send({
                message: 'No valid update values were passed.',
            });
        } else {
            cols = cols.slice(0, -2) + ' ';
            const query =
                'UPDATE books SET ' +
                cols +
                'WHERE authors LIKE $' +
                ++counter +
                ' AND title LIKE $' +
                ++counter +
                ' RETURNING *';
            values.push(request.body.author);
            values.push(request.body.title);
            pool.query(query, values)
                .then((result) => {
                    if (result.rowCount > 0) {
                        response.status(201).send({
                            entries: result.rows.map(format),
                        });
                    } else {
                        response.statusMessage =
                            'No book found with that combination of author and title';
                        response.status(404).send({
                            message:
                                'No book found with given author and title.',
                        });
                    }
                })
                .catch((error) => {
                    if (
                        error.detail != undefined &&
                        (error.detail as string).endsWith('already exists.')
                    ) {
                        response.statusMessage = 'Book already exists';
                        response.status(400).send({
                            message: 'Book already exists in database.',
                        });
                    } else {
                        response.status(500).send({
                            message: 'Server error - contact support',
                        });
                    }
                });
        }
    }
);

/**
 * @api {put} /book/addRating Request to add a rating for a book.
 *
 * @apiDescription Request to add a rating to a book with author name and book title.
 *
 * @apiName AddBookRating
 * @apiGroup AdminBook
 *
 * @apiBody {String} author Author's name, required
 * @apiBody {String} title Book title, required
 * @apiBody {Number} rating The rating that will be added to the book, required
 *
 * @apiSuccess (Success 201) {IBook} entry The book with added rating:
 * "isbn13: <code>isbn13</code>,
 * authors: <code>authors</code>,
 * publication: <code>publication_year</code>,
 * original_title: <code>original_title</code>,
 * title: <code>title</code>,
 * ratings: {
 *     average: <code>rating_avg</code>,
 *     count: <code>rating_count</code>,
 *     rating_1: <code>rating_1_star</code>,
 *     rating_2: <code>rating_2_star</code>,
 *     rating_3: <code>rating_3_star</code>,
 *     rating_4: <code>rating_4_star</code>,
 *     rating_5: <code>rating_5_star</code>
 * },
 * icons: {
 *     large: <code>image_url</code>,
 *     small: <code>image_small_url</code>
 * }"
 *
 * @apiError (400: Missing/Bad information) {String} message "Missing or bad information, see documentation."
 * @apiError (400: Invalid rating) {String} message "Invalid rating, use a number 0-5."
 *
 * @apiError (404: Author not found in database) {String} message "Author not found in database."
 * @apiError (404: Title not found in database) {String} message "Title not found in database."
 * @apiError (404: Book and Author do not match) {String} message "Book not written by specified author."
 */
adminBookRouter.put(
    '/addRating',
    //validate request body
    (request: Request, response: Response, next: NextFunction) => {
        if (
            isStringProvided(request.body.author) &&
            isStringProvided(request.body.title) &&
            isNumberProvided(request.body.rating)
        ) {
            next();
        } else {
            response.statusMessage = 'Missing/Bad information';
            response.status(400).send({
                message: 'Missing or bad information, see documentation.',
            });
        }
    },

    //validate rating
    (request: Request, response: Response, next: NextFunction) => {
        if (request.body.rating >= 1 && request.body.rating <= 5) {
            next();
        } else {
            response.statusMessage = 'Invalid rating';
            response.status(400).send({
                message: 'Invalid rating, use a number 0-5.',
            });
        }
    },

    //validate title
    (request: Request, response: Response, next: NextFunction) => {
        const query = 'SELECT title FROM books WHERE title LIKE $1';
        const values = [`%${request.body.title}%`];

        pool.query(query, values)
            .then((result) => {
                if (result.rowCount > 0) {
                    next();
                } else {
                    response.statusMessage = 'Title not found in database';
                    response.status(404).send({
                        message: 'Title not found in database.',
                    });
                }
            })
            .catch(() => {
                response.status(500).send({
                    message: 'Server error - contact support',
                });
            });
    },

    //validate author
    (request: Request, response: Response, next: NextFunction) => {
        const query = 'SELECT authors FROM books WHERE authors LIKE $1';
        const values = [`%${request.body.author}%`];
        pool.query(query, values)
            .then((result) => {
                if (result.rowCount > 0) {
                    next();
                } else {
                    response.statusMessage = 'Author not found in database';
                    response.status(404).send({
                        message: 'Author not found in database.',
                    });
                }
            })
            .catch(() => {
                response.status(500).send({
                    message: 'Server error - contact support',
                });
            });
    },

    //verify book is written by the author
    (request: Request, response: Response, next: NextFunction) => {
        const query = allButId + 'WHERE authors LIKE $1 AND title LIKE $2';
        const values = [`%${request.body.author}%`, `%${request.body.title}%`];
        pool.query(query, values)
            .then((result) => {
                if (result.rowCount > 0) {
                    next();
                } else {
                    response.statusMessage = 'Book and Author do not match';
                    response.status(404).send({
                        message: 'Book not written by specified author.',
                    });
                }
            })
            .catch(() => {
                response.status(500).send({
                    message: 'Server error - contact support',
                });
            });
    },

    (request: Request, response: Response) => {
        const columnName = 'rating_' + request.body.rating + '_star';
        const query =
            'UPDATE books SET ' +
            columnName +
            ' = ' +
            columnName +
            ' + 1, rating_count = rating_count + 1 WHERE authors LIKE $1 AND title LIKE $2 RETURNING *';
        const values = [`%${request.body.author}%`, `%${request.body.title}%`];

        pool.query(query, values)
            .then((result) => {
                response.status(201).send({
                    entries: result.rows.map(format),
                });
            })
            .catch(() => {
                response.status(500).send({
                    message: 'Server error - contact support',
                });
            });
    }
);
//Ryan end #####################

export { adminBookRouter };
