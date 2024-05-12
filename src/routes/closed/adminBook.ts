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
 * @apiBody {Number} isbn ISBN13 of the book
 * @apiBody {String} author Author's name
 * @apiBody {Number} publication Year of publication
 * @apiBody {String} original_title Original title of book, if any
 * @apiBody {String} title Book title
 * @apiBody {Number} average Average rating of the book, if any
 * @apiBody {Number} count Total number of ratings, if any
 * @apiBody {Number} rating_1 Total number of 1 star ratings, if any
 * @apiBody {Number} rating_2 Total number of 2 star ratings, if any
 * @apiBody {Number} rating_3 Total number of 3 star ratings, if any
 * @apiBody {Number} rating_4 Total number of 4 star ratings, if any
 * @apiBody {Number} rating_5 Total number of 5 star ratings, if any
 * @apiBody {String} large URL of large version of book cover, if any
 * @apiBody {String} small URL of small version of book cover, if any
 *
 * @apiSuccess (Success 201) {String} entry The String:
 * "[isbn13: <code>isbn13</code>,
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
 *     large: <code>image_url</code>,
 *     small: <code>image_small_url</code>,
 * },]"
 *
 * @apiError (400: Invalid ISBN) {String} message "Invalid ISBN, use a nonnegative number."
 * @apiError (400: Invalid year) {String} message "Invalid year, use a number."
 * @apiError (400: Invalid average rating) {String} message "Invalid average rating, use a number 0-5."
 * @apiError (400: Invalid total rating count) {String} message "Invalid total rating count, use a nonnegative number."
 * @apiError (400: Invalid star ratings) {String} message "Invalid star ratings, use nonnegative numbers."
 * @apiError (400: Missing information) {String} message "Missing required information, see documentation."
 * @apiError (400: Book already exists) {String} message "Book already exists in database."
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
 * "[isbn13: <code>isbn13</code>,
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
 *     large: <code>image_url</code>,
 *     small: <code>image_small_url</code>,
 * },]"
 *
 * @apiError (404: Author does not exist) {String} message "Author does not exist."
 */

//Max code start
/**
 * @api {delete} /adminBook Request to remove books by ISBN number
 *
 * @apiDescription Request to remove all books with the specified <code>isbn13</code>
 *
 * @apiName DeleteBooksISBN
 * @apiGroup AdminBook
 * 
 * @apiBody {Number} isbn ISBN13 of the book
 * 
 * @apiSuccess (Success 201) {String} entry The String:
 * "[isbn13: <code>isbn13</code>,
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
 *     large: <code>image_url</code>,
 *     small: <code>image_small_url</code>,
 * },]"
 *
 * @apiError (400: Invalid ISBN) {String} message "Invalid ISBN, use a nonnegative number."
 * @apiError (404: ISBN number does note xist) {String} message "ISBN number does not exist."
 */

export { adminBookRouter };
