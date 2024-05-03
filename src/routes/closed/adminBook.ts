import express, { NextFunction, Request, Response, Router } from 'express';

import { pool, validationFunctions } from '../../core/utilities';

const adminBookRouter: Router = express.Router();

/**
 * @api {post} /adminBook Request to add a book.
 *
 * @apiDescription Request to add a book with author name, isbn, publication year, and book title.
 *
 * @apiName putBook
 * @apiGroup AdminBook
 *
 * @apiBody {String} author Author's name
 * @apiBody {int} isbn ISBN13 of the book
 * @apiBody {int} publication Year of publication
 * @apiBody {String} title Book title
 *
 * @apiSuccess (Success 201) {String} entry The String:
 * `isbn13: <code>isbn13</code>,
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
 *     rating_5: <code>rating_5_star</code>,
 * },
 * icons: {
 *     large: <code>image_url</code>
 *     small: <code>image_small_url</code>
 * },`
 */

/**
 * @api {delete} /adminBook Request to remove books by author
 *
 * @apiDescription Request to remove all books with the specified <code>author</code>
 *
 * @apiName DeleteBooksAuthor
 * @apiGroup AdminBook
 *
 * @apiQuery {String} author The author's name
 *
 * @apiSuccess {String[]} entries Removed entries with the following format:
 * `isbn13: <code>isbn13</code>,
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
 *     rating_5: <code>rating_5_star</code>,
 * },
 * icons: {
 *     large: <code>image_url</code>
 *     small: <code>image_small_url</code>
 * },`
 *
 * @apiError (404: Author does not exist) {String} message "Author does not exist."
 */

export { adminBookRouter };
